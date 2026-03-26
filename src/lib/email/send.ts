// Email via Resend (https://resend.com)
// All shop details (address, phone, name) are read from the DB settings table
// so changing them in admin reflects in emails automatically.

import { Resend } from 'resend'
import { format, parseISO } from 'date-fns'
import { formatTime } from '@/lib/utils'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  return new Resend(key)
}

const FROM_EMAIL = process.env.EMAIL_FROM ?? 'Aryan Blendz <onboarding@resend.dev>'
const APP_URL    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// Fetch shop info from the DB settings table (no hardcoding)
async function getShopInfo(): Promise<{
  name:    string
  address: string
  phone:   string
  email:   string
}> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const admin = createAdminClient()
    const { data } = await admin.from('settings').select('key, value')
    const map: Record<string, string> = {}
    for (const row of data ?? []) {
      try { map[row.key] = JSON.parse(row.value) } catch { map[row.key] = row.value }
    }
    return {
      name:    map.shop_name    ?? 'Aryan Blendz',
      address: map.shop_address ?? '',
      phone:   map.shop_phone   ?? '',
      email:   map.shop_email   ?? '',
    }
  } catch {
    return { name: 'Aryan Blendz', address: '', phone: '', email: '' }
  }
}

export interface BookingEmailData {
  customerName:     string
  customerEmail:    string
  customerPhone:    string
  confirmationCode: string
  serviceName:      string
  serviceDuration:  number
  servicePrice:     number
  barberName:       string
  date:             string  // "yyyy-MM-dd"
  time:             string  // "HH:mm"
}

// ── Customer confirmation + Admin alert ──────────────────────────────────────

export async function sendBookingConfirmation(data: BookingEmailData): Promise<void> {
  const resend        = getResend()
  const shop          = await getShopInfo()
  const formattedDate = format(parseISO(data.date), 'EEEE, MMMM d, yyyy')
  const formattedTime = formatTime(data.time)
  const manageUrl     = `${APP_URL}/manage?code=${data.confirmationCode}`

  // 1. Email to customer
  const { error: custErr } = await resend.emails.send({
    from:    FROM_EMAIL,
    to:      data.customerEmail,
    subject: `Confirmed: ${data.serviceName} on ${formattedDate} at ${formattedTime} – ${shop.name}`,
    html:    buildConfirmationHtml({ ...data, formattedDate, formattedTime, manageUrl, shop }),
  })
  if (custErr) console.error('[email] customer confirmation failed:', custErr)
  else         console.log('[email] confirmation sent to', data.customerEmail)

  // 2. Alert to admin — email stored in DB settings (admin_notification_email)
  // Falls back to ADMIN_NOTIFICATION_EMAIL env var if not set in DB yet
  const { createAdminClient: ac } = await import('@/lib/supabase/admin')
  const settingsDb = ac()
  const { data: settingsRows } = await settingsDb.from('settings').select('key, value')
  const settingsMap: Record<string, string> = {}
  for (const row of settingsRows ?? []) {
    try { settingsMap[row.key] = JSON.parse(row.value) } catch { settingsMap[row.key] = row.value }
  }
  const emailNotificationsEnabled = settingsMap.email_notifications !== 'false'
  const adminEmail = settingsMap.admin_notification_email || process.env.ADMIN_NOTIFICATION_EMAIL
  if (emailNotificationsEnabled && adminEmail && adminEmail !== '') {
    const { error: adminErr } = await resend.emails.send({
      from:    FROM_EMAIL,
      to:      adminEmail,
      subject: `📅 New booking: ${data.customerName} — ${data.serviceName} on ${formattedDate} at ${formattedTime}`,
      html:    buildAdminAlertHtml({ ...data, formattedDate, formattedTime, shop }),
    })
    if (adminErr) console.error('[email] admin alert failed:', adminErr)
    else          console.log('[email] admin alert sent to', adminEmail)
  }
}

export async function sendCancellationEmail(data: {
  customerName:     string
  customerEmail:    string
  confirmationCode: string
  serviceName:      string
  date:             string
  time:             string
}): Promise<void> {
  const resend        = getResend()
  const shop          = await getShopInfo()
  const formattedDate = format(parseISO(data.date), 'EEEE, MMMM d, yyyy')
  const formattedTime = formatTime(data.time)

  const { error } = await resend.emails.send({
    from:    FROM_EMAIL,
    to:      data.customerEmail,
    subject: `Appointment Cancelled – ${shop.name}`,
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
        <p>Hope to see you again soon. <a href="${APP_URL}/booking" style="color:#C9A84C">Book again →</a></p>
        <p style="color:#444;font-size:12px;margin-top:32px">${shop.name}${shop.address ? ` · ${shop.address}` : ''}</p>
      </div>
    `,
  })
  if (error) console.error('[sendCancellationEmail]', error)
}

// ── HTML builders ─────────────────────────────────────────────────────────────

function buildConfirmationHtml(d: BookingEmailData & {
  formattedDate: string
  formattedTime: string
  manageUrl:     string
  shop:          { name: string; address: string; phone: string; email: string }
}) {
  const rows = [
    ['Service',  d.serviceName],
    ['Duration', `${d.serviceDuration} min`],
    ['Price',    `$${d.servicePrice}`],
    ['Date',     d.formattedDate],
    ['Time',     d.formattedTime],
  ]
  const rowsHtml = rows.map(([label, value], i) => `
    <tr style="border-top:${i > 0 ? '1px solid #2a2a2a' : 'none'}">
      <td style="padding:10px 0;color:#888;font-size:13px;width:40%">${label}</td>
      <td style="padding:10px 0;color:#fff;font-size:13px;font-weight:500;text-align:right">${value}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Helvetica Neue,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a">
<tr><td align="center" style="padding:40px 16px">
<table width="100%" style="max-width:560px;background:#1a1a1a;border-radius:16px;border:1px solid #2a2a2a;overflow:hidden">

<tr><td style="background:linear-gradient(135deg,#1a1a0a,#111100);border-bottom:1px solid #2a2a2a;padding:32px 40px;text-align:center">
  <div style="display:inline-block;background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.25);border-radius:10px;padding:8px 20px;margin-bottom:20px">
    <span style="color:#C9A84C;font-weight:700;font-size:13px;letter-spacing:.2em;text-transform:uppercase">✂ ${d.shop.name.toUpperCase()}</span>
  </div>
  <div style="width:64px;height:64px;border-radius:50%;background:rgba(201,168,76,.12);border:2px solid #C9A84C;margin:0 auto 16px;line-height:64px;text-align:center;font-size:28px;color:#C9A84C">✓</div>
  <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700">You're all set!</h1>
  <p style="margin:8px 0 0;color:#888;font-size:14px">Your appointment is confirmed.</p>
</td></tr>

<tr><td style="padding:24px 40px;text-align:center;border-bottom:1px solid #2a2a2a">
  <p style="margin:0 0 6px;color:#888;font-size:11px;letter-spacing:.15em;text-transform:uppercase;font-weight:600">Confirmation Code</p>
  <p style="margin:0;color:#C9A84C;font-size:28px;font-weight:700;letter-spacing:.08em;font-family:Courier New,monospace">${d.confirmationCode}</p>
  <p style="margin:8px 0 0;color:#888;font-size:12px">Save this code to manage your appointment</p>
</td></tr>

<tr><td style="padding:24px 40px;border-bottom:1px solid #2a2a2a">
  <p style="margin:0 0 16px;color:#888;font-size:11px;letter-spacing:.15em;text-transform:uppercase;font-weight:600">Appointment Details</p>
  <table width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table>
</td></tr>

${d.shop.address ? `
<tr><td style="padding:20px 40px;border-bottom:1px solid #2a2a2a;background:rgba(255,255,255,.02)">
  <p style="margin:0 0 4px;color:#888;font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:600">📍 Location</p>
  <p style="margin:0;color:#fff;font-size:13px">${d.shop.address}</p>
  ${d.shop.phone ? `<p style="margin:2px 0 0;color:#888;font-size:12px">${d.shop.phone}</p>` : ''}
</td></tr>` : ''}

<tr><td style="padding:16px 40px;border-bottom:1px solid #2a2a2a;background:rgba(34,197,94,.05)">
  <p style="margin:0;color:#4ade80;font-size:13px"><strong>Free cancellation</strong> up to 24 hours before your appointment.</p>
</td></tr>

<tr><td style="padding:28px 40px;text-align:center">
  <a href="${d.manageUrl}" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#B8972E);color:#0a0a0a;font-weight:700;font-size:14px;text-decoration:none;padding:14px 36px;border-radius:8px">Manage My Booking →</a>
  ${d.shop.phone ? `<p style="margin:16px 0 0;color:#888;font-size:12px">Questions? Call <a href="tel:${d.shop.phone.replace(/\D/g,'')}" style="color:#C9A84C;text-decoration:none">${d.shop.phone}</a></p>` : ''}
</td></tr>

<tr><td style="border-top:1px solid #2a2a2a;padding:20px 40px;text-align:center">
  <p style="margin:0;color:#444;font-size:11px">© ${new Date().getFullYear()} ${d.shop.name}${d.shop.address ? ` · ${d.shop.address}` : ''}</p>
</td></tr>

</table></td></tr></table></body></html>`.trim()
}

function buildAdminAlertHtml(d: BookingEmailData & {
  formattedDate: string
  formattedTime: string
  shop:          { name: string; address: string; phone: string }
}) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Helvetica Neue,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a">
<tr><td align="center" style="padding:40px 16px">
<table width="100%" style="max-width:480px;background:#1a1a1a;border-radius:16px;border:1px solid #2a2a2a;overflow:hidden">

<tr><td style="background:linear-gradient(135deg,#0a1a0a,#001100);border-bottom:1px solid #2a2a2a;padding:24px 32px;text-align:center">
  <span style="color:#4ade80;font-weight:700;font-size:13px;letter-spacing:.15em;text-transform:uppercase">📅 New Booking</span>
  <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:700">${d.customerName}</h1>
  ${d.customerPhone ? `<p style="margin:6px 0 0;color:#4ade80;font-size:15px;font-weight:600">${d.customerPhone}</p>` : ''}
</td></tr>

<tr><td style="padding:24px 32px">
  <table width="100%" cellpadding="0" cellspacing="0">
    ${[
      ['Service',  d.serviceName],
      ['Date',     d.formattedDate],
      ['Time',     d.formattedTime],
      ['Price',    `$${d.servicePrice}`],
      ['Email',    d.customerEmail],
      ['Phone',    d.customerPhone || '—'],
      ['Code',     d.confirmationCode],
    ].map(([label, value], i) => `
      <tr style="border-top:${i > 0 ? '1px solid #2a2a2a' : 'none'}">
        <td style="padding:10px 0;color:#888;font-size:13px;width:35%">${label}</td>
        <td style="padding:10px 0;color:#fff;font-size:13px;font-weight:500;text-align:right">${value}</td>
      </tr>
    `).join('')}
  </table>
</td></tr>

<tr><td style="border-top:1px solid #2a2a2a;padding:20px 32px;text-align:center">
  <a href="${APP_URL}/admin/appointments" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#B8972E);color:#0a0a0a;font-weight:700;font-size:13px;text-decoration:none;padding:12px 28px;border-radius:8px">View in Dashboard →</a>
</td></tr>

</table></td></tr></table></body></html>`.trim()
}
