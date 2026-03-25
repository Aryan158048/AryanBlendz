// POST /api/stripe/create-payment-intent
//
// Called by the booking page when the customer reaches the payment step.
// 1. Saves the booking to Supabase with status "pending"
// 2. Creates a Stripe PaymentIntent for the deposit amount
// 3. Returns the clientSecret to the browser (safe — it's not a secret)
//
// The booking stays "pending" until the Stripe webhook fires after payment.

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { generateConfirmationCode } from '@/lib/utils'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

const DEPOSIT_AMOUNT_CENTS = 1000 // $10.00 deposit

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      serviceId,
      barberId,
      date,
      time,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      serviceName,
      servicePrice,
      barberName,
    } = body

    // Basic validation
    if (!serviceId || !barberId || !date || !time || !customerEmail) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 })
    }

    const supabase = await createClient()
    const confirmationCode = generateConfirmationCode()

    // ── 1. Find or create the customer ──────────────────────────────────────

    let customerId: string

    const { data: existing } = await supabase
      .from('customers')
      .select('id, total_visits')
      .eq('email', customerEmail)
      .maybeSingle()

    if (existing) {
      customerId = existing.id
      await supabase
        .from('customers')
        .update({
          total_visits: ((existing.total_visits as number) ?? 0) + 1,
          last_visit: date,
          phone: customerPhone,
        })
        .eq('id', customerId)
    } else {
      const { data: created, error: customerErr } = await supabase
        .from('customers')
        .insert({
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          total_visits: 1,
          last_visit: date,
        })
        .select('id')
        .single()

      if (customerErr || !created) {
        console.error('[create-payment-intent] customer insert:', customerErr)
        return NextResponse.json({ error: 'Failed to save customer' }, { status: 500 })
      }
      customerId = created.id
    }

    // ── 2. Check for double-booking ─────────────────────────────────────────

    if (barberId !== 'any') {
      const { data: conflict } = await supabase
        .from('appointments')
        .select('id')
        .eq('barber_id', barberId)
        .eq('date', date)
        .eq('time', time)
        .in('status', ['pending', 'confirmed'])
        .maybeSingle()

      if (conflict) {
        return NextResponse.json(
          { error: 'That slot was just taken. Please pick a different time.' },
          { status: 409 },
        )
      }
    }

    // ── 3. Resolve "any" barber to a real barber ID ─────────────────────────

    let resolvedBarberId = barberId
    if (barberId === 'any') {
      const { data: anyBarber } = await supabase
        .from('barbers')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single()
      if (anyBarber) resolvedBarberId = anyBarber.id
    }

    // ── 4. Save appointment with status "pending" ───────────────────────────
    //      We mark deposit_paid: false here.
    //      The webhook will flip it to confirmed + deposit_paid: true.

    const { data: appointment, error: apptErr } = await supabase
      .from('appointments')
      .insert({
        customer_id: customerId,
        barber_id: resolvedBarberId,
        service_id: serviceId,
        date,
        time,
        status: 'pending',
        notes: notes ?? null,
        total_price: servicePrice,
        deposit_paid: false,
        confirmation_code: confirmationCode,
      })
      .select('id')
      .single()

    if (apptErr || !appointment) {
      console.error('[create-payment-intent] appointment insert:', apptErr)
      return NextResponse.json({ error: 'Failed to save appointment' }, { status: 500 })
    }

    // ── 5. Create Stripe PaymentIntent ──────────────────────────────────────

    const paymentIntent = await stripe.paymentIntents.create({
      amount: DEPOSIT_AMOUNT_CENTS,
      currency: 'usd',
      receipt_email: customerEmail,
      description: `${serviceName} deposit – Aryan Blendz`,
      metadata: {
        confirmation_code: confirmationCode,
        appointment_id: appointment.id,
        customer_email: customerEmail,
        customer_name: customerName,
        service_name: serviceName,
        barber_name: barberName,
        date,
        time,
      },
    })

    // ── 6. Return clientSecret to the browser ───────────────────────────────

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      confirmationCode,
      depositAmount: DEPOSIT_AMOUNT_CENTS / 100,
    })
  } catch (err) {
    console.error('[create-payment-intent] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
