// SMS via Twilio. Gracefully skipped if TWILIO_* env vars are not set.
// Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER in .env.local

import { format, parseISO } from 'date-fns'
import { formatTime } from '@/lib/utils'

function getClient() {
  const sid   = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token || sid === '' || token === '') return null
  // Dynamic import so missing credentials never crash the build
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const twilio = require('twilio')
  return twilio(sid, token)
}

async function sendSMS(to: string, body: string): Promise<void> {
  const client = getClient()
  const from   = process.env.TWILIO_FROM_NUMBER
  if (!client || !from || !to || to === '') return

  try {
    await client.messages.create({ body, from, to })
    console.log('[SMS] Sent to', to)
  } catch (err) {
    console.error('[SMS] Failed:', err)
    // Non-fatal — never block a booking because SMS failed
  }
}

// Sent to the customer immediately after booking
export async function sendCustomerSMSConfirmation(data: {
  customerName:    string
  customerPhone:   string
  serviceName:     string
  date:            string   // yyyy-MM-dd
  time:            string   // HH:mm
  confirmationCode: string
  shopName:        string
  shopPhone:       string
  shopAddress:     string
}): Promise<void> {
  if (!data.customerPhone) return
  const d = format(parseISO(data.date), 'EEE, MMM d')
  const t = formatTime(data.time)
  const body =
    `✂️ ${data.shopName}: Hi ${data.customerName}! ` +
    `Your ${data.serviceName} is confirmed for ${d} at ${t}. ` +
    `Code: ${data.confirmationCode}. ` +
    `${data.shopAddress}. Questions? Call ${data.shopPhone}.`
  await sendSMS(data.customerPhone, body)
}

// Sent to the shop owner whenever a new booking comes in
// Admin phone is read from DB settings (admin_phone key), falls back to ADMIN_PHONE env var
export async function sendAdminSMSAlert(data: {
  customerName:  string
  customerPhone: string
  serviceName:   string
  date:          string
  time:          string
}): Promise<void> {
  // Read admin_phone and sms_reminders from DB settings
  let adminPhone = process.env.ADMIN_PHONE ?? ''
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const admin = createAdminClient()
    const { data: rows } = await admin.from('settings').select('key, value')
    const map: Record<string, string> = {}
    for (const row of rows ?? []) {
      try { map[row.key] = JSON.parse(row.value) } catch { map[row.key] = row.value }
    }
    if (map.sms_reminders === 'false') return   // admin turned off SMS
    if (map.admin_phone) adminPhone = map.admin_phone
  } catch { /* fall through to env var */ }
  if (!adminPhone || adminPhone === '') return
  const d = format(parseISO(data.date), 'EEE, MMM d')
  const t = formatTime(data.time)
  const body =
    `📅 New booking! ${data.customerName} booked ${data.serviceName} ` +
    `on ${d} at ${t}. Phone: ${data.customerPhone || 'not provided'}.`
  await sendSMS(adminPhone, body)
}
