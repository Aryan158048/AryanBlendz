// Email sending utilities using Resend
// https://resend.com — free tier: 3,000 emails/month
//
// Setup:
//   1. Create account at resend.com
//   2. Add domain or use their test domain
//   3. Create API key at resend.com/api-keys
//   4. Add RESEND_API_KEY to .env.local

import { Resend } from 'resend'
import { BookingConfirmationEmail } from './templates/booking-confirmation'
import { format, parseISO } from 'date-fns'
import { formatTime, getDurationLabel } from '@/lib/utils'

// Lazy-init so missing key doesn't crash at module load in dev
function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    throw new Error('RESEND_API_KEY is not set in environment variables')
  }
  return new Resend(key)
}

const FROM_EMAIL = process.env.EMAIL_FROM ?? 'Aryan Blendz <noreply@aryanblendz.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export interface BookingEmailData {
  customerName: string
  customerEmail: string
  confirmationCode: string
  serviceName: string
  serviceDuration: number
  servicePrice: number
  barberName: string
  date: string   // ISO "yyyy-MM-dd"
  time: string   // "HH:mm"
}

/**
 * Send a booking confirmation email to the customer.
 * Call this from a Server Action or API Route Handler after saving the booking.
 */
export async function sendBookingConfirmation(data: BookingEmailData): Promise<void> {
  const resend = getResend()

  // Format date/time for display
  const formattedDate = format(parseISO(data.date), 'EEEE, MMMM d, yyyy')
  const formattedTime = formatTime(data.time)
  const manageUrl = `${APP_URL}/manage?code=${data.confirmationCode}`

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: data.customerEmail,
    subject: `Confirmed: ${data.serviceName} on ${formattedDate} at ${formattedTime} – Aryan Blendz`,
    react: BookingConfirmationEmail({
      customerName: data.customerName,
      confirmationCode: data.confirmationCode,
      serviceName: data.serviceName,
      serviceDuration: data.serviceDuration,
      servicePrice: data.servicePrice,
      barberName: data.barberName,
      date: formattedDate,
      time: formattedTime,
      customerEmail: data.customerEmail,
      manageUrl,
    }),
  })

  if (error) {
    // Log but don't crash the booking flow — email is non-critical
    console.error('[sendBookingConfirmation] Resend error:', error)
    throw new Error(`Failed to send confirmation email: ${error.message}`)
  }
}

/**
 * Send a cancellation notification email.
 */
export async function sendCancellationEmail(data: {
  customerName: string
  customerEmail: string
  confirmationCode: string
  serviceName: string
  date: string
  time: string
}): Promise<void> {
  const resend = getResend()

  const formattedDate = format(parseISO(data.date), 'EEEE, MMMM d, yyyy')
  const formattedTime = formatTime(data.time)

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: data.customerEmail,
    subject: `Appointment Cancelled – Aryan Blendz`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #fff; background: #111; padding: 32px; border-radius: 12px;">
        <h2 style="color: #C9A84C; margin-top: 0;">Appointment Cancelled</h2>
        <p>Hi ${data.customerName},</p>
        <p>Your appointment has been cancelled.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="color: #888; padding: 8px 0;">Service</td><td style="color: #fff;">${data.serviceName}</td></tr>
          <tr><td style="color: #888; padding: 8px 0;">Date</td><td style="color: #fff;">${formattedDate}</td></tr>
          <tr><td style="color: #888; padding: 8px 0;">Time</td><td style="color: #fff;">${formattedTime}</td></tr>
          <tr><td style="color: #888; padding: 8px 0;">Code</td><td style="color: #C9A84C; font-family: monospace;">${data.confirmationCode}</td></tr>
        </table>
        <p>We hope to see you again soon. <a href="${APP_URL}/booking" style="color: #C9A84C;">Book a new appointment</a></p>
        <p style="color: #555; font-size: 12px; margin-top: 32px;">Aryan Blendz · 123 Style Ave, New York, NY 10001</p>
      </div>
    `,
  })

  if (error) {
    console.error('[sendCancellationEmail] Resend error:', error)
  }
}
