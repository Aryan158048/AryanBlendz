// ─────────────────────────────────────────────────────────────────────────────
// Free-Time Overlap Engine
//
// Algorithm:
//   1. For each day Mon–Fri:
//   2. Combine admin class blocks + student class blocks
//   3. Sort and merge all overlapping busy blocks
//   4. Subtract merged blocks from the business-hours window
//   5. Walk each free window in `appointmentDuration` increments → booking slots
// ─────────────────────────────────────────────────────────────────────────────

import type {
  DayOfWeek,
  ClassBlock,
  WeeklySchedule,
  ScheduleSettings,
  AvailableSlot,
  AvailableSlotsMap,
} from './types'
import { SCHEDULE_DAYS } from './types'

// ── Time helpers ──────────────────────────────────────────────────────────────

/** Convert "HH:MM" → minutes since midnight */
export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** Convert minutes since midnight → "HH:MM" */
export function fromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

/** "HH:MM" (24 h) → "H:MM AM/PM" */
export function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

// ── Core helpers ──────────────────────────────────────────────────────────────

/**
 * Given a list of busy blocks and a [businessStart, businessEnd] window,
 * return the free sub-windows (already clipped to business hours).
 */
function getFreeWindows(
  busyBlocks: ClassBlock[],
  businessStart: number,
  businessEnd: number,
): Array<{ start: number; end: number }> {
  // Map to minute ranges and sort
  const sorted = busyBlocks
    .map(b => ({ start: toMinutes(b.start), end: toMinutes(b.end) }))
    .sort((a, b) => a.start - b.start)

  // Merge overlapping / adjacent blocks
  const merged: Array<{ start: number; end: number }> = []
  for (const block of sorted) {
    if (merged.length === 0 || block.start >= merged[merged.length - 1].end) {
      merged.push({ ...block })
    } else {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, block.end)
    }
  }

  // Subtract merged blocks from business-hours window
  const free: Array<{ start: number; end: number }> = []
  let cursor = businessStart

  for (const block of merged) {
    // Clip block to business hours
    const bStart = Math.max(block.start, businessStart)
    const bEnd = Math.min(block.end, businessEnd)
    if (bStart >= businessEnd) break
    if (bStart > cursor) {
      free.push({ start: cursor, end: bStart })
    }
    cursor = Math.max(cursor, bEnd)
  }

  if (cursor < businessEnd) {
    free.push({ start: cursor, end: businessEnd })
  }

  return free
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Calculate bookable slots for the week by cross-referencing both schedules.
 *
 * @param adminSchedule   Admin's class busy-blocks (from DB)
 * @param studentSchedule Student's class busy-blocks (just parsed)
 * @param settings        Business hours + appointment duration
 * @returns               Map of day → list of AvailableSlot
 */
export function calculateAvailableSlots(
  adminSchedule: WeeklySchedule,
  studentSchedule: WeeklySchedule,
  settings: ScheduleSettings,
): AvailableSlotsMap {
  const businessStart = toMinutes(settings.businessHoursStart)
  const businessEnd = toMinutes(settings.businessHoursEnd)
  const duration = settings.appointmentDuration

  const result = {} as AvailableSlotsMap

  for (const day of SCHEDULE_DAYS) {
    const allBusy: ClassBlock[] = [
      ...(adminSchedule[day] ?? []),
      ...(studentSchedule[day] ?? []),
    ]

    const freeWindows = getFreeWindows(allBusy, businessStart, businessEnd)
    const slots: AvailableSlot[] = []

    for (const win of freeWindows) {
      let slotStart = win.start
      while (slotStart + duration <= win.end) {
        const slotEnd = slotStart + duration
        const startStr = fromMinutes(slotStart)
        const endStr = fromMinutes(slotEnd)
        slots.push({
          day,
          start: startStr,
          end: endStr,
          startFormatted: formatTime12h(startStr),
          endFormatted: formatTime12h(endStr),
        })
        slotStart += duration
      }
    }

    result[day] = slots
  }

  return result
}
