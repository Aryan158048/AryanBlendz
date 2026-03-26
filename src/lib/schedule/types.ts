// ─────────────────────────────────────────────────────────────────────────────
// Schedule Feature — Core Types
// Used by the Rutgers schedule upload, parser, overlap engine, and UI.
// ─────────────────────────────────────────────────────────────────────────────

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

/** Mon–Fri only for appointment scheduling */
export const SCHEDULE_DAYS: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
]

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

export const DAY_SHORT: Record<DayOfWeek, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
}

/**
 * A single busy block on a given day.
 * Times are 24-hour "HH:MM" strings (e.g. "10:20", "13:30").
 */
export interface ClassBlock {
  /** Stable client-side id for React keys and edit operations */
  id: string
  start: string
  end: string
  title: string
}

/** Full weekly schedule keyed by day name. Missing days = no classes. */
export type WeeklySchedule = Partial<Record<DayOfWeek, ClassBlock[]>>

/** Configurable parameters for the schedule-overlap engine */
export interface ScheduleSettings {
  /** "HH:MM" — earliest a booking can start, default "09:00" */
  businessHoursStart: string
  /** "HH:MM" — latest a booking can end, default "19:00" */
  businessHoursEnd: string
  /** Appointment length in minutes: 30 | 45 | 60 */
  appointmentDuration: number
}

/** A single mutual free slot that can be offered for booking */
export interface AvailableSlot {
  day: DayOfWeek
  start: string        // "HH:MM"
  end: string          // "HH:MM"
  startFormatted: string  // "1:30 PM"
  endFormatted: string    // "2:00 PM"
}

export type AvailableSlotsMap = Record<DayOfWeek, AvailableSlot[]>
