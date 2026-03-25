// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'barber' | 'customer'

export interface User {
  id: string
  email: string
  role: UserRole
  name: string
  phone?: string
  avatar_url?: string
  created_at: string
}

// ─── Barber ──────────────────────────────────────────────────────────────────

export interface Barber {
  id: string
  user_id: string
  name: string
  bio?: string
  specialties: string[]
  avatar_url?: string
  is_active: boolean
  instagram?: string
  years_experience?: number
  rating?: number
  total_reviews?: number
}

// ─── Service ─────────────────────────────────────────────────────────────────

export type ServiceCategory =
  | 'haircut'
  | 'beard'
  | 'combo'
  | 'kids'
  | 'premium'
  | 'other'

export interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: ServiceCategory
  is_active: boolean
  display_order: number
  image_url?: string
}

// ─── Appointment ─────────────────────────────────────────────────────────────

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export interface Appointment {
  id: string
  customer_id: string
  barber_id: string
  service_id: string
  date: string
  time: string
  status: AppointmentStatus
  notes?: string
  total_price: number
  deposit_paid: boolean
  confirmation_code: string
  created_at: string
  updated_at: string
  customer?: Customer
  barber?: Barber
  service?: Service
}

// ─── Availability ─────────────────────────────────────────────────────────────

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface Availability {
  id: string
  barber_id: string
  day_of_week: DayOfWeek
  start_time: string
  end_time: string
  is_available: boolean
}

// ─── Blocked Dates ────────────────────────────────────────────────────────────

export interface BlockedDate {
  id: string
  barber_id: string | null
  date: string
  reason?: string
  created_at: string
}

// ─── Customer ────────────────────────────────────────────────────────────────

export interface Customer {
  id: string
  user_id: string
  name: string
  email: string
  phone?: string
  notes?: string
  total_visits: number
  last_visit?: string
  created_at: string
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export type PaymentStatus = 'pending' | 'paid' | 'refunded'

export interface Payment {
  id: string
  appointment_id: string
  amount: number
  status: PaymentStatus
  stripe_payment_intent_id?: string
  created_at: string
}

// ─── Scheduling ──────────────────────────────────────────────────────────────

export interface TimeSlot {
  time: string
  available: boolean
  label?: string
}

// ─── Booking Flow ────────────────────────────────────────────────────────────

export type BookingStep =
  | 'service'
  | 'barber'
  | 'datetime'
  | 'details'
  | 'payment'
  | 'confirmation'

export interface BookingState {
  step: BookingStep
  selectedService?: Service
  selectedBarber?: Barber
  selectedDate?: string
  selectedTime?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  notes?: string
  confirmationCode?: string
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalAppointments: number
  pendingAppointments: number
  confirmedAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  totalRevenue: number
  revenueThisMonth: number
  newCustomersThisMonth: number
  totalCustomers: number
  averageRating?: number
  upcomingToday: number
  noShowRate: number
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export interface Testimonial {
  id: string
  author: string
  avatar?: string
  role?: string
  rating: number
  content: string
  date: string
  service?: string
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ─── Form Types ──────────────────────────────────────────────────────────────

export interface BookingFormValues {
  customerName: string
  email: string
  phone: string
  serviceId: string
  barberId: string
  date: string
  time: string
  notes?: string
}

export interface LoginFormValues {
  email: string
  password: string
}

export interface RegisterFormValues {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export interface ServiceFormValues {
  name: string
  description: string
  duration: number
  price: number
  category: ServiceCategory
  is_active: boolean
  display_order: number
}

export interface AvailabilityFormValues {
  barber_id: string
  day_of_week: DayOfWeek
  start_time: string
  end_time: string
  is_available: boolean
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  children?: NavItem[]
  badge?: string | number
}

// ─── Misc ────────────────────────────────────────────────────────────────────

export type SortOrder = 'asc' | 'desc'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface SelectOption<T = string> {
  label: string
  value: T
  disabled?: boolean
  icon?: React.ComponentType<{ className?: string }>
}
