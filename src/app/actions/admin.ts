'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { AppointmentStatus } from '@/types'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (data?.role !== 'admin') throw new Error('Forbidden')
}

// Returns the first active barber's ID — no barber name hardcoded
async function getActiveBarberId(): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin.from('barbers').select('id').eq('is_active', true).order('created_at', { ascending: true }).limit(1).single()
  return data?.id ?? null
}

export async function adminUpdateAppointmentStatus(id: string, status: AppointmentStatus) {
  await requireAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('appointments').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function adminGetDashboardData() {
  await requireAdmin()
  const admin = createAdminClient()

  const today = new Date().toISOString().split('T')[0]
  const d = new Date()
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  const weekStart = d.toISOString().split('T')[0]

  const { data: barberRow } = await admin
    .from('barbers').select('id, rating').eq('is_active', true).order('created_at', { ascending: true }).limit(1).single()
  if (!barberRow) return null
  const bid = barberRow.id

  const [todayRes, recentRes, todayCount, custCount, weekRev] = await Promise.all([
    admin
      .from('appointments')
      .select('id, time, status, customers(name), services(name)')
      .eq('barber_id', bid)
      .eq('date', today)
      .in('status', ['pending', 'confirmed', 'completed'])
      .order('time'),
    admin
      .from('appointments')
      .select('id, date, time, status, confirmation_code, total_price, customers(name), services(name)')
      .eq('barber_id', bid)
      .order('created_at', { ascending: false })
      .limit(6),
    admin
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('barber_id', bid)
      .eq('date', today),
    admin
      .from('customers')
      .select('*', { count: 'exact', head: true }),
    admin
      .from('appointments')
      .select('total_price')
      .eq('barber_id', bid)
      .eq('status', 'completed')
      .gte('date', weekStart),
  ])

  return {
    todayRows:    (todayRes.data   ?? []) as any[],
    recentRows:   (recentRes.data  ?? []) as any[],
    todayCount:   todayCount.count ?? 0,
    custCount:    custCount.count  ?? 0,
    weekRevTotal: ((weekRev.data ?? []) as any[]).reduce((s: number, a: any) => s + (a.total_price ?? 0), 0),
    barberRating: (barberRow as any).rating ?? 4.9,
  }
}

export async function adminGetAppointments() {
  await requireAdmin()
  const admin = createAdminClient()
  const bid = await getActiveBarberId()
  if (!bid) return []
  const barberRow = { id: bid }

  const { data } = await admin
    .from('appointments')
    .select('id, date, time, status, confirmation_code, total_price, created_at, customer_id, customers(name, email, total_visits), services(name)')
    .eq('barber_id', barberRow.id)
    .order('date', { ascending: false })
    .order('time', { ascending: false })

  return (data ?? []) as any[]
}

export async function adminGetCustomers() {
  await requireAdmin()
  const admin = createAdminClient()

  const { data } = await admin
    .from('customers')
    .select('id, name, email, phone, notes, total_visits, last_visit, created_at')
    .order('created_at', { ascending: false })

  return (data ?? []) as any[]
}

export async function adminGetCustomerAppointments(customerId: string) {
  await requireAdmin()
  const admin = createAdminClient()

  const { data } = await admin
    .from('appointments')
    .select('id, date, status, total_price, services(name)')
    .eq('customer_id', customerId)
    .order('date', { ascending: false })
    .limit(10)

  return (data ?? []) as any[]
}

export async function adminSaveCustomerNotes(customerId: string, notes: string) {
  await requireAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('customers').update({ notes }).eq('id', customerId)
  if (error) throw new Error(error.message)
}

export async function adminGetServices() {
  await requireAdmin()
  const admin = createAdminClient()
  const { data } = await admin.from('services').select('*').order('display_order')
  return (data ?? []) as any[]
}

export async function adminUpsertService(payload: any) {
  await requireAdmin()
  const admin = createAdminClient()
  if (payload.id) {
    const { id, ...rest } = payload
    const { error } = await admin.from('services').update(rest).eq('id', id)
    if (error) throw new Error(error.message)
    return null
  } else {
    const { data, error } = await admin.from('services').insert(payload).select().single()
    if (error) throw new Error(error.message)
    return data
  }
}

export async function adminDeleteService(id: string) {
  await requireAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('services').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function adminToggleService(id: string, is_active: boolean) {
  await requireAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('services').update({ is_active }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function adminGetAvailability(barberId: string) {
  await requireAdmin()
  const admin = createAdminClient()
  const today = new Date().toISOString().split('T')[0]
  const [availRes, blockedRes] = await Promise.all([
    admin.from('availability').select('day_of_week, start_time, end_time, is_available').eq('barber_id', barberId),
    admin.from('blocked_dates').select('id, date, reason').eq('barber_id', barberId).gte('date', today).order('date'),
  ])
  return { availability: availRes.data ?? [], blocked: blockedRes.data ?? [] }
}

export async function adminSaveSchedule(schedule: any[], barberId: string) {
  await requireAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('availability').upsert(
    schedule.map((d) => ({
      barber_id:    barberId,
      day_of_week:  d.dayOfWeek,
      start_time:   d.startTime + ':00',
      end_time:     d.endTime   + ':00',
      is_available: d.isAvailable,
    })),
    { onConflict: 'barber_id,day_of_week' }
  )
  if (error) throw new Error(error.message)
}

export async function adminAddBlockedDate(barberId: string, date: string, reason: string) {
  await requireAdmin()
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('blocked_dates')
    .insert({ barber_id: barberId, date, reason })
    .select('id, date, reason')
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function adminRemoveBlockedDate(id: string) {
  await requireAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('blocked_dates').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function adminGetBarberInfo() {
  await requireAdmin()
  const admin = createAdminClient()
  const { data } = await admin
    .from('barbers')
    .select('id, name, bio, specialties, instagram, years_experience, rating, total_reviews')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()
  return data as any
}

export async function adminUpdateBarberInfo(payload: {
  name?: string; bio?: string; instagram?: string; years_experience?: number; rating?: number
}) {
  await requireAdmin()
  const bid = await getActiveBarberId()
  if (!bid) throw new Error('No active barber found')
  const admin = createAdminClient()
  const { error } = await admin.from('barbers').update(payload).eq('id', bid)
  if (error) throw new Error(error.message)
}

export async function adminGetBarberId() {
  await requireAdmin()
  return getActiveBarberId()
}

// ── Settings (key-value store) ────────────────────────────────────────────────

export async function adminGetSettings(): Promise<Record<string, string>> {
  await requireAdmin()
  const admin = createAdminClient()
  const { data } = await admin.from('settings').select('key, value')
  const map: Record<string, string> = {}
  for (const row of data ?? []) {
    try { map[row.key] = JSON.parse(row.value) } catch { map[row.key] = row.value }
  }
  return map
}

export async function adminSaveSetting(key: string, value: string) {
  await requireAdmin()
  const admin = createAdminClient()
  const { error } = await admin
    .from('settings')
    .upsert({ key, value: JSON.stringify(value) }, { onConflict: 'key' })
  if (error) throw new Error(error.message)
}

export async function adminSaveSettings(pairs: Record<string, string>) {
  await requireAdmin()
  const admin = createAdminClient()
  const rows = Object.entries(pairs).map(([key, value]) => ({ key, value: JSON.stringify(value) }))
  const { error } = await admin.from('settings').upsert(rows, { onConflict: 'key' })
  if (error) throw new Error(error.message)
}
