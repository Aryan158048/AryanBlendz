'use server'

// ─────────────────────────────────────────────────────────────────────────────
// Schedule Server Actions
//
// Covers:
//   - Admin weekly schedule CRUD (stored in weekly_schedules table)
//   - Schedule settings (business hours + appointment duration, in settings table)
//   - Overlap calculation (loads admin schedule + settings, applies student schedule)
// ─────────────────────────────────────────────────────────────────────────────

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { calculateAvailableSlots } from '@/lib/schedule/overlap'
import type {
  WeeklySchedule,
  ScheduleSettings,
  AvailableSlotsMap,
} from '@/lib/schedule/types'
import { SCHEDULE_DAYS } from '@/lib/schedule/types'

// ── Auth guard ────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (data?.role !== 'admin') throw new Error('Admin access required')
  return { supabase, user, admin: createAdminClient() }
}

// ── Admin weekly schedule ─────────────────────────────────────────────────────

/**
 * Fetch the current active admin schedule from the DB.
 * Returns null if no schedule has been saved yet.
 */
export async function adminGetWeeklySchedule(): Promise<{
  id: string
  schedule: WeeklySchedule
  semester: string
} | null> {
  try {
    // Use admin client so RLS doesn't block this public-ish read
    const db = createAdminClient()
    const { data } = await db
      .from('weekly_schedules')
      .select('id, schedule_data, semester')
      .eq('role', 'admin')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!data) return null
    return {
      id: data.id as string,
      schedule: (data.schedule_data ?? {}) as WeeklySchedule,
      semester: (data.semester as string) ?? 'Current',
    }
  } catch {
    return null
  }
}

/**
 * Save (or replace) the admin's weekly schedule.
 * Deactivates any prior active admin schedule before inserting the new one.
 */
export async function adminSaveWeeklySchedule(
  schedule: WeeklySchedule,
  semester = 'Current',
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, admin } = await requireAdmin()

    // Deactivate all existing admin schedules
    await admin
      .from('weekly_schedules')
      .update({ is_active: false })
      .eq('role', 'admin')

    const { error } = await admin.from('weekly_schedules').insert({
      user_id: user.id,
      role: 'admin',
      semester,
      schedule_data: schedule,
      is_active: true,
    })

    if (error) throw error
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save schedule',
    }
  }
}

// ── Schedule settings ─────────────────────────────────────────────────────────

const SETTINGS_KEYS = {
  hoursStart: 'schedule_hours_start',
  hoursEnd: 'schedule_hours_end',
  duration: 'schedule_appt_duration',
}

const DEFAULT_SETTINGS: ScheduleSettings = {
  businessHoursStart: '09:00',
  businessHoursEnd: '19:00',
  appointmentDuration: 30,
}

/**
 * Load schedule-specific settings (business hours + appointment duration).
 * Falls back to defaults if not yet configured.
 */
export async function getScheduleSettings(): Promise<ScheduleSettings> {
  try {
    const db = createAdminClient()
    const { data } = await db
      .from('settings')
      .select('key, value')
      .in('key', Object.values(SETTINGS_KEYS))

    const map: Record<string, string> = {}
    for (const row of data ?? []) {
      try {
        map[row.key] = JSON.parse(row.value as string) as string
      } catch {
        map[row.key] = row.value as string
      }
    }

    return {
      businessHoursStart: map[SETTINGS_KEYS.hoursStart] ?? DEFAULT_SETTINGS.businessHoursStart,
      businessHoursEnd: map[SETTINGS_KEYS.hoursEnd] ?? DEFAULT_SETTINGS.businessHoursEnd,
      appointmentDuration: Number(
        map[SETTINGS_KEYS.duration] ?? DEFAULT_SETTINGS.appointmentDuration,
      ),
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

/**
 * Persist updated schedule settings (admin only).
 */
export async function adminSaveScheduleSettings(
  settings: Partial<ScheduleSettings>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { admin } = await requireAdmin()

    const rows: Array<{ key: string; value: string }> = []

    if (settings.businessHoursStart !== undefined)
      rows.push({ key: SETTINGS_KEYS.hoursStart, value: JSON.stringify(settings.businessHoursStart) })
    if (settings.businessHoursEnd !== undefined)
      rows.push({ key: SETTINGS_KEYS.hoursEnd, value: JSON.stringify(settings.businessHoursEnd) })
    if (settings.appointmentDuration !== undefined)
      rows.push({ key: SETTINGS_KEYS.duration, value: JSON.stringify(String(settings.appointmentDuration)) })

    if (rows.length > 0) {
      const { error } = await admin.from('settings').upsert(rows, { onConflict: 'key' })
      if (error) throw error
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save settings',
    }
  }
}

// ── Overlap calculation ───────────────────────────────────────────────────────

/**
 * Given a student's schedule, load the admin schedule + settings from the DB
 * and return the list of mutually free booking slots for the week.
 *
 * This is the main entry point called from the student-facing schedule page.
 */
export async function getAvailableSlotsForStudent(studentSchedule: WeeklySchedule): Promise<{
  slots: AvailableSlotsMap
  settings: ScheduleSettings
  hasAdminSchedule: boolean
}> {
  const [adminData, settings] = await Promise.all([
    adminGetWeeklySchedule(),
    getScheduleSettings(),
  ])

  // Build an empty map for the case where admin hasn't uploaded a schedule yet
  if (!adminData) {
    const empty = {} as AvailableSlotsMap
    for (const day of SCHEDULE_DAYS) empty[day] = []
    return { slots: empty, settings, hasAdminSchedule: false }
  }

  const slots = calculateAvailableSlots(adminData.schedule, studentSchedule, settings)
  return { slots, settings, hasAdminSchedule: true }
}
