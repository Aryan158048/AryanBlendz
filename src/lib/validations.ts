import { z } from 'zod'

// ─── Reusable field schemas ───────────────────────────────────────────────────

const emailField = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim()

const phoneField = z
  .string()
  .min(1, 'Phone number is required')
  .regex(
    /^\+?[\d\s\-().]{7,15}$/,
    'Please enter a valid phone number',
  )
  .trim()

const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

const nameField = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(80, 'Name must be 80 characters or fewer')
  .trim()

// ─── Booking Schema ───────────────────────────────────────────────────────────

export const bookingSchema = z.object({
  customerName: nameField,
  email: emailField,
  phone: phoneField,
  serviceId: z.string().min(1, 'Please select a service'),
  barberId: z.string().min(1, 'Please select a barber'),
  date: z
    .string()
    .min(1, 'Please select a date')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time: z
    .string()
    .min(1, 'Please select a time')
    .regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  notes: z.string().max(500, 'Notes must be 500 characters or fewer').optional(),
})

export type BookingSchemaValues = z.infer<typeof bookingSchema>

// ─── Login Schema ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
})

export type LoginSchemaValues = z.infer<typeof loginSchema>

// ─── Register Schema ──────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    name: nameField,
    email: emailField,
    phone: phoneField,
    password: passwordField,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegisterSchemaValues = z.infer<typeof registerSchema>

// ─── Service Schema ───────────────────────────────────────────────────────────

export const serviceSchema = z.object({
  name: z
    .string()
    .min(2, 'Service name must be at least 2 characters')
    .max(100, 'Service name must be 100 characters or fewer')
    .trim(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be 500 characters or fewer')
    .trim(),
  duration: z
    .number()
    .int('Duration must be a whole number')
    .min(10, 'Duration must be at least 10 minutes')
    .max(240, 'Duration cannot exceed 240 minutes'),
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(1000, 'Price cannot exceed $1,000'),
  category: z.enum(['haircut', 'beard', 'combo', 'kids', 'premium', 'other'], {
    error: 'Please select a valid category',
  }),
  is_active: z.boolean().default(true),
  display_order: z
    .number()
    .int('Display order must be a whole number')
    .min(0, 'Display order cannot be negative')
    .default(0),
})

export type ServiceSchemaValues = z.infer<typeof serviceSchema>

// ─── Availability Schema ──────────────────────────────────────────────────────

export const availabilitySchema = z
  .object({
    barber_id: z.string().min(1, 'Please select a barber'),
    day_of_week: z
      .number()
      .int()
      .min(0, 'Invalid day')
      .max(6, 'Invalid day') as z.ZodType<0 | 1 | 2 | 3 | 4 | 5 | 6>,
    start_time: z
      .string()
      .min(1, 'Start time is required')
      .regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
    end_time: z
      .string()
      .min(1, 'End time is required')
      .regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
    is_available: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (!data.is_available) return true
      const [startH, startM] = data.start_time.split(':').map(Number)
      const [endH, endM] = data.end_time.split(':').map(Number)
      const startMins = startH * 60 + startM
      const endMins = endH * 60 + endM
      return endMins > startMins
    },
    {
      message: 'End time must be after start time',
      path: ['end_time'],
    },
  )

export type AvailabilitySchemaValues = z.infer<typeof availabilitySchema>

// ─── Blocked Date Schema ──────────────────────────────────────────────────────

export const blockedDateSchema = z.object({
  barber_id: z.string().nullable().optional(),
  date: z
    .string()
    .min(1, 'Date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  reason: z
    .string()
    .max(200, 'Reason must be 200 characters or fewer')
    .optional(),
})

export type BlockedDateSchemaValues = z.infer<typeof blockedDateSchema>

// ─── Contact / Enquiry Schema ─────────────────────────────────────────────────

export const contactSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField.optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be 1,000 characters or fewer')
    .trim(),
})

export type ContactSchemaValues = z.infer<typeof contactSchema>

// ─── Update Profile Schema ────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: nameField,
  phone: phoneField.optional(),
  avatar_url: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
})

export type UpdateProfileSchemaValues = z.infer<typeof updateProfileSchema>
