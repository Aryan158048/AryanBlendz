// Email sending via Resend (https://resend.com)
// Uses plain HTML — no React render dependency, works immediately.
//
// FROM address rules:
//   Free tier test:  onboarding@resend.dev  (sends to any address)
//   Custom domain:   anything@yourdomain.com (after DNS verification in Resend dashboard)
//   Gmail / Yahoo:   ❌ not allowed as FROM address

import { Resend } from 'resend'
import { format, parseISO } from 'date-fns'
import { formatTime } from '@/lib/utils'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  return new Resend(key)
}

// Use Resend's test sender while testing — works without domain verification.
// When you have a real domain, change this to: Aryan Blendz <hello@yourdomain.com>
const FROM_EMAIL = process.env.EMAIL_FROM ?? 'Aryan Blendz <onboarding@resend.dev>'
const APP_URL    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export interface BookingEmailData {
  customerName:    string
  customerEmail:   string
  confirmationCode: string
  serviceName:     string
  serviceDuration: number
  servicePrice:    number
  barberName:      string
  date: string   // "yyyy-MM-dd"
  time: string   // "HH:mm"
}

export async function sendBookingConfirmation(data: BookingEmailData): Promise<void> {
  const resend       = getResend()
  const formattedDate = format(parseISO(data.date), 'EEEE, MMMM d, yyyy')
  const formattedTime = formatTime(data.time)
  const manageUrl    = `${APP_URL}/manage?code=${data.confirmationCode}`

  const html = buildConfirmationHtml({
    ...data,
    formattedDate,
    formattedTime,
    manageUrl,
  })

  const { data: sent, error } = await resend.emails.send({
    from:    FROM_EMAIL,
    to:      data.customerEmail,
    subject: `Confirmed: ${data.serviceName} on ${formattedDate} at ${formattedTime} – Aryan Blendz`,
    html,
  })

  if (error) {
    console.error('[sendBookingConfirmation] Resend error:', error)
    throw new Error(`Email failed: ${error.message}`)
  }

  console.log('[sendBookingConfirmation] Sent — id:', sent?.id)
}

export async function sendCancellationEmail(data: {
  customerName:    string
  customerEmail:   string
  confirmationCode: string
  serviceName:     string
  date: string
  time: string
}): Promise<void> {
  const resend        = getResend()
  const formattedDate = format(parseISO(data.date), 'EEEE, MMMM d, yyyy')
  const formattedTime = formatTime(data.time)

  const { error } = await resend.emails.send({
    from:    FROM_EMAIL,
    to:      data.customerEmail,
    subject: `Appointment Cancelled – Aryan Blendz`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#111;color:#fff;padding:32px;border-radius:12px">
        <h2 style="color:#C9A84C;margin-top:0">Appointment Cancelled</h2>
        <p>Hi ${data.customerName},</p>
        <p>Your appointment has been cancelled.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="color:#888;padding:8px 0">Service</td><td style="color:#fff">${data.serviceName}</td></tr>
          <tr><td style="color:#888;padding:8px 0">Date</td>   <td style="color:#fff">${formattedDate}</td></tr>
          <tr><td style="color:#888;padding:8px 0">Time</td>   <td style="color:#fff">${formattedTime}</td></tr>
          <tr><td style="color:#888;padding:8px 0">Code</td>   <td style="color:#C9A84C;font-family:monospace">${data.confirmationCode}</td></tr>
        </table>
        <p>We hope to see you again soon. <a href="${APP_URL}/booking" style="color:#C9A84C">Book again →</a></p>
        <p style="color:#444;font-size:12px;margin-top:32px">Aryan Blendz · Judson Suites, 103 Davidson Rd, Piscataway, NJ 08854</p>
      </div>
    `,
  })

  if (error) console.error('[sendCancellationEmail]', error)
}

// ─── HTML template (inline styles for email client compatibility) ────────────

function buildConfirmationHtml(d: BookingEmailData & {
  formattedDate: string
  formattedTime: string
  manageUrl: string
}) {
  const rows = [
    ['Service',  d.serviceName],
    ['Duration', `${d.serviceDuration} minutes`],
    ['Price',    `$${d.servicePrice}`],
    ['Barber',   d.barberName],
    ['Date',     d.formattedDate],
    ['Time',     d.formattedTime],
  ]

  const rowsHtml = rows.map(([label, value], i) => `
    <tr style="border-top:${i > 0 ? '1px solid #2a2a2a' : 'none'}">
      <td style="padding:10px 0;color:#888;font-size:13px;width:40%">${label}</td>
      <td style="padding:10px 0;color:#fff;font-size:13px;font-weight:500;text-align:right">${value}</td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Helvetica Neue,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a">
    <tr><td align="center" style="padding:40px 16px">
      <table width="100%" style="max-width:560px;background:#1a1a1a;border-radius:16px;border:1px solid #2a2a2a;overflow:hidden">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a1a0a,#111100);border-bottom:1px solid #2a2a2a;padding:32px 40px;text-align:center">
          <div style="display:inline-block;background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.25);border-radius:10px;padding:8px 20px;margin-bottom:20px">
            <span style="color:#C9A84C;font-weight:700;font-size:13px;letter-spacing:.2em;text-transform:uppercase">✂ ARYAN BLENDZ</span>
          </div>
          <div style="width:64px;height:64px;border-radius:50%;background:rgba(201,168,76,.12);border:2px solid #C9A84C;margin:0 auto 16px;line-height:64px;text-align:center;font-size:28px;color:#C9A84C">✓</div>
          <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;letter-spacing:-.02em">You're all set!</h1>
          <p style="margin:8px 0 0;color:#888;font-size:14px">Your appointment has been confirmed.</p>
        </td></tr>

        <!-- Confirmation code -->
        <tr><td style="padding:24px 40px;text-align:center;border-bottom:1px solid #2a2a2a">
          <p style="margin:0 0 6px;color:#888;font-size:11px;letter-spacing:.15em;text-transform:uppercase;font-weight:600">Confirmation Code</p>
          <p style="margin:0;color:#C9A84C;font-size:28px;font-weight:700;letter-spacing:.08em;font-family:Courier New,monospace">${d.confirmationCode}</p>
          <p style="margin:8px 0 0;color:#888;font-size:12px">Save this code to manage your appointment</p>
        </td></tr>

        <!-- Details -->
        <tr><td style="padding:24px 40px;border-bottom:1px solid #2a2a2a">
          <p style="margin:0 0 16px;color:#888;font-size:11px;letter-spacing:.15em;text-transform:uppercase;font-weight:600">Appointment Details</p>
          <table width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table>
        </td></tr>

        <!-- Location -->
        <tr><td style="padding:20px 40px;border-bottom:1px solid #2a2a2a;background:rgba(255,255,255,.02)">
          <p style="margin:0 0 4px;color:#888;font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:600">📍 Location</p>
          <p style="margin:0;color:#fff;font-size:13px">Judson Suites, 103 Davidson Rd, Piscataway, NJ 08854</p>
          <p style="margin:2px 0 0;color:#888;font-size:12px">201-748-9849</p>
        </td></tr>

        <!-- Free cancellation notice -->
        <tr><td style="padding:16px 40px;border-bottom:1px solid #2a2a2a;background:rgba(34,197,94,.05)">
          <p style="margin:0;color:#4ade80;font-size:13px"><strong>Free cancellation</strong> up to 24 hours before your appointment.</p>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:28px 40px;text-align:center">
          <a href="${d.manageUrl}" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#B8972E);color:#0a0a0a;font-weight:700;font-size:14px;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:.04em">Manage My Booking →</a>
          <p style="margin:16px 0 0;color:#888;font-size:12px">Questions? Call <a href="tel:+12017489849" style="color:#C9A84C;text-decoration:none">201-748-9849</a></p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="border-top:1px solid #2a2a2a;padding:20px 40px;text-align:center">
          <p style="margin:0;color:#444;font-size:11px">© ${new Date().getFullYear()} Aryan Blendz · Judson Suites, 103 Davidson Rd, Piscataway, NJ 08854</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim()
}
