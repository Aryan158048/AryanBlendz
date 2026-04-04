'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { AppointmentStatus } from '@/types'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (data?.role !== 'admin') throw new Error('Forbidden')
}

async function getActiveBarberId(): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('barbers').select('id').eq('is_active', true)
    .order('created_at', { ascending: true }).limit(1).single()
  return data?.id ?? null
}

// Days between cuts per service category (prototype values)
const REBOOKING_CYCLES: Record<string, number> = {
  haircut: 21,
  beard:   14,
  combo:   21,
  kids:    21,
  premium: 28,
  other:   21,
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export type InsightsData = {
  // Booking volume
  totalBookings:     number
  completedBookings: number
  noShowRate:        number    // 0-1
  cancellationRate:  number    // 0-1

  // Revenue (past 90 days)
  totalRevenue: number

  // Customers
  totalCustomers:   number
  repeatCustomers:  number    // total_visits >= 2
  repeatRate:       number    // 0-1

  // Hourly heatmap — index = hour (0-23), value = booking count
  hourlyBookings: number[]

  // Daily heatmap — index = day (0=Sun), value = booking count
  dailyBookings: number[]
  peakDay: string

  // Top services
  topServices: { name: string; count: number; revenue: number; category: string }[]

  // Clients due for rebooking (overdue or within 2 weeks)
  dueForRebooking: {
    name: string
    email: string
    lastVisit: string
    lastService: string
    daysSince: number
    cycledays: number
    overdue: boolean
  }[]
}

export async function adminGetInsightsData(): Promise<InsightsData | null> {
  await requireAdmin()
  const admin = createAdminClient()
  const bid = await getActiveBarberId()
  if (!bid) return null

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() - 90)
  const cutoffStr = cutoff.toISOString().split('T')[0]

  const [apptRes, customersRes] = await Promise.all([
    admin
      .from('appointments')
      .select('date, time, status, total_price, customer_id, services(name, category)')
      .eq('barber_id', bid)
      .gte('date', cutoffStr),
    admin
      .from('customers')
      .select('id, name, email, total_visits, last_visit'),
  ])

  const apts       = (apptRes.data       ?? []) as any[]
  const customers  = (customersRes.data  ?? []) as any[]

  // ── Heatmaps ────────────────────────────────────────────────────────────────
  const hourlyBookings = Array<number>(24).fill(0)
  const dailyBookings  = Array<number>(7).fill(0)

  // ── Service map ─────────────────────────────────────────────────────────────
  const svcMap = new Map<string, { name: string; category: string; count: number; revenue: number }>()

  // ── Revenue & rates ─────────────────────────────────────────────────────────
  let totalRevenue   = 0
  let noShowCount    = 0
  let cancelCount    = 0
  let completedCount = 0

  // ── Last service per customer ────────────────────────────────────────────────
  // key = customer_id, value = { serviceName, serviceCategory, date }
  const lastSvcMap = new Map<string, { name: string; category: string; date: string }>()

  for (const apt of apts) {
    const hour      = parseInt((apt.time as string).split(':')[0], 10)
    const dayOfWeek = new Date((apt.date as string) + 'T12:00:00').getDay()
    hourlyBookings[hour]++
    dailyBookings[dayOfWeek]++

    const svc = apt.services as { name: string; category: string } | null
    if (svc) {
      const existing = svcMap.get(svc.name)
      if (existing) {
        existing.count++
        if ((apt.status as AppointmentStatus) === 'completed') existing.revenue += apt.total_price ?? 0
      } else {
        svcMap.set(svc.name, {
          name: svc.name,
          category: svc.category,
          count: 1,
          revenue: apt.status === 'completed' ? (apt.total_price ?? 0) : 0,
        })
      }

      // Track most recent completed service per customer
      if (apt.status === 'completed' && apt.customer_id) {
        const prev = lastSvcMap.get(apt.customer_id)
        if (!prev || (apt.date as string) > prev.date) {
          lastSvcMap.set(apt.customer_id, { name: svc.name, category: svc.category, date: apt.date })
        }
      }
    }

    if (apt.status === 'completed') { completedCount++; totalRevenue += apt.total_price ?? 0 }
    if (apt.status === 'no_show')   noShowCount++
    if (apt.status === 'cancelled') cancelCount++
  }

  const totalBookings     = apts.length
  const noShowRate        = totalBookings > 0 ? noShowCount    / totalBookings : 0
  const cancellationRate  = totalBookings > 0 ? cancelCount    / totalBookings : 0

  const topServices = [...svcMap.values()].sort((a, b) => b.count - a.count).slice(0, 5)
  const peakDayIdx  = dailyBookings.indexOf(Math.max(...dailyBookings))
  const peakDay     = DAY_NAMES[peakDayIdx] ?? 'N/A'

  // ── Customer stats ───────────────────────────────────────────────────────────
  const totalCustomers  = customers.length
  const repeatCustomers = customers.filter((c: any) => (c.total_visits ?? 0) >= 2).length
  const repeatRate      = totalCustomers > 0 ? repeatCustomers / totalCustomers : 0

  // ── Rebooking predictions ────────────────────────────────────────────────────
  const todayMs     = new Date(todayStr + 'T12:00:00').getTime()
  const windowMs    = 14 * 24 * 60 * 60 * 1000  // 2-week lookahead

  const dueForRebooking = customers
    .filter((c: any) => c.last_visit)
    .map((c: any) => {
      const lastSvc    = lastSvcMap.get(c.id)
      const category   = lastSvc?.category ?? 'haircut'
      const cycle      = REBOOKING_CYCLES[category] ?? 21
      const lastVisitMs = new Date((c.last_visit as string) + 'T12:00:00').getTime()
      const dueMs      = lastVisitMs + cycle * 24 * 60 * 60 * 1000
      const daysSince  = Math.floor((todayMs - lastVisitMs) / (24 * 60 * 60 * 1000))
      const overdue    = dueMs < todayMs
      const dueSoon    = dueMs <= todayMs + windowMs

      if (!dueSoon) return null

      return {
        name:        c.name as string,
        email:       c.email as string,
        lastVisit:   c.last_visit as string,
        lastService: lastSvc?.name ?? 'Unknown',
        daysSince,
        cycledays:   cycle,
        overdue,
      }
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.daysSince - a.daysSince)
    .slice(0, 15) as InsightsData['dueForRebooking']

  return {
    totalBookings,
    completedBookings: completedCount,
    noShowRate,
    cancellationRate,
    totalRevenue,
    totalCustomers,
    repeatCustomers,
    repeatRate,
    hourlyBookings,
    dailyBookings,
    peakDay,
    topServices,
    dueForRebooking,
  }
}

// Returns per-customer risk history map for no-show scoring on appointments page
export async function adminGetCustomerRiskMap(): Promise<
  Record<string, { noShows: number; cancellations: number }>
> {
  await requireAdmin()
  const admin = createAdminClient()
  const bid = await getActiveBarberId()
  if (!bid) return {}

  const { data } = await admin
    .from('appointments')
    .select('customer_id, status')
    .eq('barber_id', bid)
    .in('status', ['no_show', 'cancelled'])

  const map: Record<string, { noShows: number; cancellations: number }> = {}
  for (const row of data ?? []) {
    if (!map[row.customer_id]) map[row.customer_id] = { noShows: 0, cancellations: 0 }
    if (row.status === 'no_show')   map[row.customer_id].noShows++
    if (row.status === 'cancelled') map[row.customer_id].cancellations++
  }
  return map
}
