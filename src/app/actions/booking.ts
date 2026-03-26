'use server'

// ── Public data actions (no auth required) ────────────────────────────────────

export async function getBarberProfile() {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()
  const [barberRes, custRes] = await Promise.all([
    admin.from('barbers').select('name, bio, specialties, instagram, years_experience, rating, total_reviews').eq('is_active', true).order('created_at', { ascending: true }).limit(1).single(),
    admin.from('customers').select('*', { count: 'exact', head: true }),
  ])
  const b = barberRes.data ?? {}
  return {
    name:            (b as any).name            ?? 'Aryan',
    bio:             (b as any).bio             ?? '',
    specialties:     (b as any).specialties     ?? [],
    instagram:       (b as any).instagram       ?? '@aryanblendz',
    yearsExperience: (b as any).years_experience ?? 8,
    rating:          (b as any).rating          ?? 4.9,
    totalReviews:    (b as any).total_reviews   ?? 0,
    totalCustomers:  custRes.count              ?? 0,
  }
}

export async function getPublicHours() {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()
  const { data: barberRow } = await admin.from('barbers').select('id').eq('is_active', true).order('created_at', { ascending: true }).limit(1).single()
  if (!barberRow) return []
  const { data } = await admin
    .from('availability')
    .select('day_of_week, start_time, end_time, is_available')
    .eq('barber_id', barberRow.id)
    .order('day_of_week')
  return (data ?? []) as { day_of_week: number; start_time: string; end_time: string; is_available: boolean }[]
}

export async function getActiveServices() {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()
  const { data } = await admin
    .from('services')
    .select('id, name, description, price, duration, category')
    .eq('is_active', true)
    .order('display_order')
  return (data ?? []) as any[]
}

export async function getBarberSchedule() {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()
  const { data: barberRow } = await admin
    .from('barbers').select('id').eq('is_active', true).order('created_at', { ascending: true }).limit(1).single()
  if (!barberRow) return { closedDays: [0,1,2,3,4,5,6] as number[], blockedDates: [] as string[] }

  const today = new Date().toISOString().split('T')[0]
  const future = new Date(); future.setMonth(future.getMonth() + 4)
  const futureDate = future.toISOString().split('T')[0]

  const [availRes, blockedRes] = await Promise.all([
    admin.from('availability').select('day_of_week, is_available').eq('barber_id', barberRow.id),
    admin.from('blocked_dates').select('date').eq('barber_id', barberRow.id).gte('date', today).lte('date', futureDate),
  ])

  const closedDays = ((availRes.data ?? []) as any[])
    .filter((a) => !a.is_available)
    .map((a) => a.day_of_week as number)

  return {
    closedDays,
    blockedDates: ((blockedRes.data ?? []) as any[]).map((b) => b.date as string),
  }
}

export async function getAvailableSlots(date: string) {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()
  const { data: barberRow } = await admin
    .from('barbers').select('id').eq('is_active', true).order('created_at', { ascending: true }).limit(1).single()
  if (!barberRow) return { open: false, slots: [] as string[], booked: [] as string[] }

  const dayOfWeek = new Date(date + 'T12:00:00').getDay()
  const { data: avail } = await admin
    .from('availability')
    .select('is_available, start_time, end_time')
    .eq('barber_id', barberRow.id)
    .eq('day_of_week', dayOfWeek)
    .single()

  if (!avail?.is_available) return { open: false, slots: [] as string[], booked: [] as string[] }

  const { data: blocked } = await admin
    .from('blocked_dates').select('id').eq('barber_id', barberRow.id).eq('date', date).maybeSingle()
  if (blocked) return { open: false, slots: [] as string[], booked: [] as string[] }

  // Generate 30-min slots between open/close
  const [sh, sm] = avail.start_time.split(':').map(Number)
  const [eh, em] = avail.end_time.split(':').map(Number)
  const slots: string[] = []
  for (let m = sh * 60 + sm; m < eh * 60 + em; m += 30) {
    slots.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
  }

  const { data: apts } = await admin
    .from('appointments')
    .select('time')
    .eq('barber_id', barberRow.id)
    .eq('date', date)
    .in('status', ['pending', 'confirmed'])

  return {
    open: true,
    slots,
    booked: ((apts ?? []) as any[]).map((a) => (a.time as string).slice(0, 5)),
  }
}


// Server Action: createBooking
// 1. Validates input
// 2. Resolves barber + service UUIDs from the DB (static IDs → real UUIDs)
// 3. Finds or creates the customer row
// 4. Checks for double-booking
// 5. Inserts the appointment
// 6. Sends confirmation email (non-blocking)

import { createAdminClient } from '@/lib/supabase/admin'
import { sendBookingConfirmation } from '@/lib/email/send'
import { sendCustomerSMSConfirmation, sendAdminSMSAlert } from '@/lib/sms/send'
import { generateConfirmationCode } from '@/lib/utils'
import { z } from 'zod'

const bookingSchema = z.object({
  serviceId:       z.string().min(1),
  barberId:        z.string().min(1),
  date:            z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time:            z.string().regex(/^\d{2}:\d{2}$/),
  customerName:    z.string().min(2).max(60),
  customerEmail:   z.string().email(),
  customerPhone:   z.string().min(7).max(20),
  notes:           z.string().max(300).optional(),
  // Display values passed from the client (for email + fallback)
  serviceName:     z.string(),
  servicePrice:    z.number().positive(),
  serviceDuration: z.number().positive(),
  barberName:      z.string(),
})

export type BookingInput = z.infer<typeof bookingSchema>

export interface BookingResult {
  success: boolean
  confirmationCode?: string
  error?: string
}

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid booking data. Please check your details.' }
  }

  const data = parsed.data
  const confirmationCode = generateConfirmationCode()

  // Use admin client — bypasses RLS so we can write from a guest booking
  const supabase = createAdminClient()

  try {
    // ── 1. Resolve service UUID ──────────────────────────────────────────────
    // The booking components use local IDs ('1', 'svc_haircut', etc.)
    // Match against the DB by name instead.
    const { data: serviceRow, error: serviceErr } = await supabase
      .from('services')
      .select('id, name, price, duration')
      .ilike('name', `%${data.serviceName}%`)
      .eq('is_active', true)
      .limit(1)
      .single()

    if (serviceErr || !serviceRow) {
      console.error('[createBooking] service lookup:', serviceErr)
      return { success: false, error: 'Service not found. Please try again.' }
    }

    // ── 2. Resolve barber UUID ───────────────────────────────────────────────
    let barberRow: { id: string; name: string } | null = null

    if (data.barberId !== 'any') {
      // Try matching by name (e.g. barberName = 'Aryan')
      const { data: found } = await supabase
        .from('barbers')
        .select('id, name')
        .ilike('name', data.barberName)
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      barberRow = found
    }

    // If "any" or no match, grab the first active barber
    if (!barberRow) {
      const { data: fallback } = await supabase
        .from('barbers')
        .select('id, name')
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      barberRow = fallback
    }

    if (!barberRow) {
      return { success: false, error: 'No barbers available. Please contact us directly.' }
    }

    // ── 3. Find or create customer ───────────────────────────────────────────
    let customerId: string

    const { data: existing } = await supabase
      .from('customers')
      .select('id, total_visits')
      .eq('email', data.customerEmail)
      .maybeSingle()

    if (existing) {
      customerId = existing.id
      await supabase
        .from('customers')
        .update({
          total_visits: ((existing.total_visits as number) ?? 0) + 1,
          last_visit: data.date,
          phone: data.customerPhone,
        })
        .eq('id', customerId)
    } else {
      const { data: created, error: customerErr } = await supabase
        .from('customers')
        .insert({
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
          total_visits: 1,
          last_visit: data.date,
        })
        .select('id')
        .single()

      if (customerErr || !created) {
        console.error('[createBooking] customer insert:', customerErr)
        return { success: false, error: 'Failed to save your details. Please try again.' }
      }
      customerId = created.id
    }

    // ── 4. Check for double-booking ──────────────────────────────────────────
    const { data: conflict } = await supabase
      .from('appointments')
      .select('id')
      .eq('barber_id', barberRow.id)
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

    // ── 5. Insert appointment ────────────────────────────────────────────────
    const { error: apptErr } = await supabase
      .from('appointments')
      .insert({
        customer_id:       customerId,
        barber_id:         barberRow.id,
        service_id:        serviceRow.id,
        date:              data.date,
        time:              data.time,
        status:            'confirmed',
        notes:             data.notes ?? null,
        total_price:       serviceRow.price,
        deposit_paid:      false,
        confirmation_code: confirmationCode,
      })

    if (apptErr) {
      console.error('[createBooking] appointment insert:', apptErr)
      return { success: false, error: 'Failed to save your appointment. Please try again.' }
    }

    // ── 6. Notifications (email + SMS, non-blocking) ─────────────────────────
    // Read shop info once for SMS messages
    const shopSettings = await supabase.from('settings').select('key, value')
    const shopMap: Record<string, string> = {}
    for (const row of shopSettings.data ?? []) {
      try { shopMap[row.key] = JSON.parse(row.value) } catch { shopMap[row.key] = row.value }
    }
    const shopName    = shopMap.shop_name    ?? 'Aryan Blendz'
    const shopPhone   = shopMap.shop_phone   ?? ''
    const shopAddress = shopMap.shop_address ?? ''

    // Email (customer confirmation + admin alert built into one call)
    sendBookingConfirmation({
      customerName:    data.customerName,
      customerEmail:   data.customerEmail,
      customerPhone:   data.customerPhone,
      confirmationCode,
      serviceName:     serviceRow.name,
      serviceDuration: serviceRow.duration as number,
      servicePrice:    Number(serviceRow.price),
      barberName:      barberRow.name,
      date:            data.date,
      time:            data.time,
    }).catch((e) => console.error('[createBooking] email:', e))

    // SMS to customer
    sendCustomerSMSConfirmation({
      customerName:    data.customerName,
      customerPhone:   data.customerPhone,
      serviceName:     serviceRow.name,
      date:            data.date,
      time:            data.time,
      confirmationCode,
      shopName,
      shopPhone,
      shopAddress,
    }).catch((e) => console.error('[createBooking] customer SMS:', e))

    // SMS alert to admin
    sendAdminSMSAlert({
      customerName:  data.customerName,
      customerPhone: data.customerPhone,
      serviceName:   serviceRow.name,
      date:          data.date,
      time:          data.time,
    }).catch((e) => console.error('[createBooking] admin SMS:', e))

    return { success: true, confirmationCode }
  } catch (err) {
    console.error('[createBooking] unexpected:', err)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}
