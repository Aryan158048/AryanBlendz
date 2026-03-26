import type {
  Service,
  TimeSlot,
  AppointmentStatus,
  BookingStep,
  SelectOption,
} from '@/types'

// ─── Services ────────────────────────────────────────────────────────────────

export const SERVICES: Service[] = [
  {
    id: 'svc_haircut',
    name: 'Classic Haircut',
    description:
      'Precision cut tailored to your face shape and style preference. Includes wash, cut, and styling.',
    duration: 45,
    price: 35,
    category: 'haircut',
    is_active: true,
    display_order: 1,
  },
  {
    id: 'svc_beard',
    name: 'Beard Trim & Shape',
    description:
      'Expert beard sculpting, trimming, and lining to give your beard a clean, defined look.',
    duration: 30,
    price: 25,
    category: 'beard',
    is_active: true,
    display_order: 2,
  },
  {
    id: 'svc_lineup',
    name: 'Lineup / Edge Up',
    description:
      'Sharp, clean lines on your hairline, temples, and neck for a fresh, polished finish.',
    duration: 20,
    price: 20,
    category: 'haircut',
    is_active: true,
    display_order: 3,
  },
  {
    id: 'svc_combo',
    name: 'Haircut + Beard Combo',
    description:
      'The full package — precision haircut combined with a beard trim and lineup for the complete look.',
    duration: 70,
    price: 55,
    category: 'combo',
    is_active: true,
    display_order: 4,
  },
  {
    id: 'svc_kids',
    name: "Kids Cut (12 & Under)",
    description:
      'Gentle, patient haircuts for the little ones. We make sure every kid leaves smiling.',
    duration: 30,
    price: 25,
    category: 'kids',
    is_active: true,
    display_order: 5,
  },
  {
    id: 'svc_premium',
    name: 'Premium Grooming Package',
    description:
      'The ultimate experience: haircut, hot towel shave, beard sculpting, scalp massage, and styling.',
    duration: 90,
    price: 75,
    category: 'premium',
    is_active: true,
    display_order: 6,
  },
]

// ─── Business Hours ───────────────────────────────────────────────────────────

export const BUSINESS_HOURS: Record<
  number,
  { label: string; open: string; close: string; isOpen: boolean }
> = {
  0: { label: 'Sunday',    open: '10:00', close: '17:00', isOpen: true },
  1: { label: 'Monday',    open: '09:00', close: '19:00', isOpen: true },
  2: { label: 'Tuesday',   open: '09:00', close: '19:00', isOpen: true },
  3: { label: 'Wednesday', open: '09:00', close: '19:00', isOpen: true },
  4: { label: 'Thursday',  open: '09:00', close: '19:00', isOpen: true },
  5: { label: 'Friday',    open: '09:00', close: '20:00', isOpen: true },
  6: { label: 'Saturday',  open: '09:00', close: '18:00', isOpen: true },
}

// ─── Booking Steps ────────────────────────────────────────────────────────────

export const BOOKING_STEPS: Array<{
  id: BookingStep
  label: string
  description: string
  step: number
}> = [
  {
    id: 'service',
    label: 'Choose Service',
    description: 'Select the service you want',
    step: 1,
  },
  {
    id: 'datetime',
    label: 'Date & Time',
    description: 'Select your appointment slot',
    step: 2,
  },
  {
    id: 'details',
    label: 'Your Details',
    description: 'Enter your contact information',
    step: 3,
  },
  {
    id: 'confirmation',
    label: 'Confirm',
    description: 'Review and confirm booking',
    step: 4,
  },
]

// ─── Time Slots ───────────────────────────────────────────────────────────────

function generateTimeSlots(
  startHour: number,
  endHour: number,
  intervalMinutes: number = 30,
): TimeSlot[] {
  const slots: TimeSlot[] = []
  let current = startHour * 60
  const end = endHour * 60

  while (current < end) {
    const hours = Math.floor(current / 60)
    const minutes = current % 60
    const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    slots.push({ time, available: true })
    current += intervalMinutes
  }

  return slots
}

export const TIME_SLOTS: TimeSlot[] = generateTimeSlots(9, 19, 30)

// ─── Status Colors ────────────────────────────────────────────────────────────

export const STATUS_COLORS: Record<
  AppointmentStatus,
  { bg: string; text: string; border: string; dot: string }
> = {
  pending: {
    bg:     'bg-yellow-500/10',
    text:   'text-yellow-400',
    border: 'border-yellow-500/30',
    dot:    'bg-yellow-400',
  },
  confirmed: {
    bg:     'bg-blue-500/10',
    text:   'text-blue-400',
    border: 'border-blue-500/30',
    dot:    'bg-blue-400',
  },
  completed: {
    bg:     'bg-green-500/10',
    text:   'text-green-400',
    border: 'border-green-500/30',
    dot:    'bg-green-400',
  },
  cancelled: {
    bg:     'bg-red-500/10',
    text:   'text-red-400',
    border: 'border-red-500/30',
    dot:    'bg-red-400',
  },
  no_show: {
    bg:     'bg-gray-500/10',
    text:   'text-gray-400',
    border: 'border-gray-500/30',
    dot:    'bg-gray-400',
  },
}

// ─── Service Categories ───────────────────────────────────────────────────────

export const SERVICE_CATEGORIES: SelectOption[] = [
  { label: 'Haircut',   value: 'haircut' },
  { label: 'Beard',     value: 'beard' },
  { label: 'Combo',     value: 'combo' },
  { label: 'Kids',      value: 'kids' },
  { label: 'Premium',   value: 'premium' },
  { label: 'Other',     value: 'other' },
]

// ─── Days of the Week ─────────────────────────────────────────────────────────

export const DAYS_OF_WEEK: Array<{ value: number; label: string; short: string }> = [
  { value: 0, label: 'Sunday',    short: 'Sun' },
  { value: 1, label: 'Monday',    short: 'Mon' },
  { value: 2, label: 'Tuesday',   short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday',  short: 'Thu' },
  { value: 5, label: 'Friday',    short: 'Fri' },
  { value: 6, label: 'Saturday',  short: 'Sat' },
]

// ─── App Metadata ─────────────────────────────────────────────────────────────

export const APP_NAME = 'Aryan Blendz'
export const APP_DESCRIPTION =
  'Premium cuts and fades. Book your appointment with Aryan online in seconds.'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
export const CONTACT_EMAIL  = 'hello@aryanblendz.com'
export const CONTACT_PHONE  = '201-748-9849'
export const SHOP_ADDRESS   = 'Judson Suites, 103 Davidson Rd, Piscataway, NJ 08854'
export const DEPOSIT_AMOUNT = 10
