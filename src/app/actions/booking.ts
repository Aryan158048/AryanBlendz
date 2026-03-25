'use server'

// Server Action: createBooking
// Called from the booking page when the customer clicks "Confirm Booking"
// 1. Validates input
// 2. Saves to Supabase
// 3. Sends confirmation email via Resend
// 4. Returns confirmation code to redirect to /booking/confirmation

import { createClient } from '@/lib/supabase/server'
import { sendBookingConfirmation } from '@/lib/email/send'
import { generateConfirmationCode } from '@/lib/utils'
import { z } from 'zod'

// ─── Validation schema ─────────────────────────────────────────────────────

const bookingSchema = z.object({
  serviceId:     z.string().min(1),
  barberId:      z.string().min(1),
  date:          z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time:          z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  customerName:  z.string().min(2).max(60),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(7).max(20),
  notes:         z.string().max(300).optional(),
  serviceName:   z.string(),
  servicePrice:  z.number().positive(),
  serviceDuration: z.number().positive(),
  barberName:    z.string(),
})

export type BookingInput = z.infer<typeof bookingSchema>

export interface BookingResult {
  success: boolean
  confirmationCode?: string
  error?: string
}

// ─── Server Action ─────────────────────────────────────────────────────────

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  // 1. Validate
  const parsed = bookingSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.message }
  }

  const data = parsed.data
  const confirmationCode = generateConfirmationCode()

  try {
    const supabase = await createClient()

    // 2. Find or create customer
    let customerId: string

    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id, total_visits')
      .eq('email', data.customerEmail)
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.id

      // Update total_visits + last_visit
      await supabase
        .from('customers')
        .update({
          total_visits: ((existingCustomer.total_visits as number) ?? 0) + 1,
          last_visit: data.date,
          phone: data.customerPhone,
        })
        .eq('id', customerId)
    } else {
      // Create new customer
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name:  data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
          total_visits: 1,
          last_visit: data.date,
        })
        .select('id')
        .single()

      if (customerError || !newCustomer) {
        console.error('[createBooking] Failed to create customer:', customerError)
        return { success: false, error: 'Failed to save your details. Please try again.' }
      }

      customerId = newCustomer.id
    }

    // 3. Check for double-booking (same barber, date, time)
    if (data.barberId !== 'any') {
      const { data: conflict } = await supabase
        .from('appointments')
        .select('id')
        .eq('barber_id', data.barberId)
        .eq('date', data.date)
        .eq('time', data.time)
        .in('status', ['pending', 'confirmed'])
        .maybeSingle()

      if (conflict) {
        return {
          success: false,
          error: 'That time slot was just booked. Please choose a different time.',
        }
      }
    }

    // 4. Resolve barber ID (if "any", pick first available — simplified here)
    const barberId =
      data.barberId === 'any'
        ? (await supabase.from('barbers').select('id').eq('is_active', true).limit(1).single()).data?.id ?? data.barberId
        : data.barberId

    // 5. Insert appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        customer_id:       customerId,
        barber_id:         barberId,
        service_id:        data.serviceId,
        date:              data.date,
        time:              data.time,
        status:            'confirmed',
        notes:             data.notes ?? null,
        total_price:       data.servicePrice,
        deposit_paid:      false,
        confirmation_code: confirmationCode,
      })
      .select('id')
      .single()

    if (appointmentError || !appointment) {
      console.error('[createBooking] Failed to create appointment:', appointmentError)
      return { success: false, error: 'Failed to save your appointment. Please try again.' }
    }

    // 6. Send confirmation email (non-blocking — don't fail booking if email fails)
    try {
      await sendBookingConfirmation({
        customerName:    data.customerName,
        customerEmail:   data.customerEmail,
        confirmationCode,
        serviceName:     data.serviceName,
        serviceDuration: data.serviceDuration,
        servicePrice:    data.servicePrice,
        barberName:      data.barberName,
        date:            data.date,
        time:            data.time,
      })
    } catch (emailError) {
      // Email failed — booking is still saved. Log and continue.
      console.error('[createBooking] Email send failed (non-fatal):', emailError)
    }

    return { success: true, confirmationCode }
  } catch (error) {
    console.error('[createBooking] Unexpected error:', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}
