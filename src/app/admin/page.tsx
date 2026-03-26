'use client'

import { useState, useEffect } from 'react'
import {
  Calendar, DollarSign, Users, Star,
  Clock, MoreHorizontal, CheckCircle, XCircle, Loader2, Plus,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { adminGetDashboardData, adminUpdateAppointmentStatus } from '@/app/actions/admin'
import { toast } from 'sonner'
import type { AppointmentStatus } from '@/types'

function fmt12h(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const statusCfg = {
  confirmed: { label: 'Confirmed', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  pending:   { label: 'Pending',   className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  completed: { label: 'Done',      className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  no_show:   { label: 'No Show',   className: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
} as const

type RecentAppt = {
  id: string
  date: string
  time: string
  status: AppointmentStatus
  confirmation_code: string
  total_price: number | null
  customer_name: string
  service_name: string
}

type TodayAppt = { id: string; time: string; status: string; customer_name: string; service_name: string }

export default function AdminDashboard() {
  const [loading, setLoading]             = useState(true)
  const [stats, setStats]                 = useState({ today: 0, revenue: 0, customers: 0, rating: 4.9 })
  const [todaySchedule, setTodaySchedule] = useState<TodayAppt[]>([])
  const [recentApts, setRecentApts]       = useState<RecentAppt[]>([])

  useEffect(() => {
    adminGetDashboardData().then((data) => {
      if (!data) { setLoading(false); return }
      setTodaySchedule(data.todayRows.map((a: any) => ({
        id:            a.id,
        time:          a.time,
        status:        a.status,
        customer_name: a.customers?.name ?? 'Unknown',
        service_name:  a.services?.name  ?? 'Unknown',
      })))
      setRecentApts(data.recentRows.map((a: any) => ({
        id:                a.id,
        date:              a.date,
        time:              a.time,
        status:            a.status,
        confirmation_code: a.confirmation_code,
        total_price:       a.total_price,
        customer_name:     a.customers?.name ?? 'Unknown',
        service_name:      a.services?.name  ?? 'Unknown',
      })))
      setStats({ today: data.todayCount, revenue: data.weekRevTotal, customers: data.custCount, rating: data.barberRating })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    try {
      await adminUpdateAppointmentStatus(id, status)
      setRecentApts((prev) => prev.map((a) => a.id === id ? { ...a, status } : a))
      toast.success(`Marked as ${status}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-white">{getGreeting()}, Aryan</h2>
          <p className="text-white/35 text-xs mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </div>
      </div>

      {/* Stats — 2×2 on mobile, 4 across on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Calendar,    label: "Today",      value: String(stats.today),             sub: 'appointments' },
          { icon: DollarSign,  label: 'This Week',  value: `$${stats.revenue.toFixed(0)}`,  sub: 'revenue' },
          { icon: Users,       label: 'Customers',  value: String(stats.customers),          sub: 'all time' },
          { icon: Star,        label: 'Rating',     value: String(stats.rating),             sub: 'avg score' },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="glass gold-border rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/35 text-xs font-medium">{label}</span>
              <div className="w-7 h-7 rounded-lg bg-gold-500/10 flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-gold-500" />
              </div>
            </div>
            <div className="font-display text-2xl font-bold text-white leading-none">{value}</div>
            <div className="text-white/25 text-xs mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="glass gold-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/8">
          <div>
            <h3 className="font-display text-base font-bold text-white">Today&apos;s Schedule</h3>
            <p className="text-white/35 text-xs mt-0.5">{todaySchedule.length} appointment{todaySchedule.length !== 1 ? 's' : ''}</p>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs px-3" asChild>
            <Link href="/admin/appointments">View All</Link>
          </Button>
        </div>

        {todaySchedule.length === 0 ? (
          <div className="py-10 text-center">
            <Calendar className="w-8 h-8 text-white/15 mx-auto mb-2" />
            <p className="text-white/30 text-sm">Nothing scheduled today</p>
            <Button size="sm" variant="outline" className="mt-3 h-8 text-xs" asChild>
              <Link href="/booking"><Plus className="w-3 h-3" />New Booking</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {todaySchedule.map((apt) => {
              const s = statusCfg[apt.status as keyof typeof statusCfg] ?? statusCfg.pending
              return (
                <div key={apt.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex items-center gap-1.5 w-16 flex-shrink-0">
                    <Clock className="w-3 h-3 text-white/20" />
                    <span className="text-white/40 text-xs font-mono">{fmt12h(apt.time)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{apt.customer_name}</div>
                    <div className="text-white/30 text-xs truncate">{apt.service_name}</div>
                  </div>
                  <Badge className={`text-[10px] px-2 py-0.5 border flex-shrink-0 ${s.className}`}>
                    {s.label}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      <div className="glass gold-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/8">
          <div>
            <h3 className="font-display text-base font-bold text-white">Recent Bookings</h3>
            <p className="text-white/35 text-xs mt-0.5">Latest appointments</p>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs px-3" asChild>
            <Link href="/admin/appointments">View All</Link>
          </Button>
        </div>

        {recentApts.length === 0 ? (
          <div className="py-10 text-center">
            <Calendar className="w-8 h-8 text-white/15 mx-auto mb-2" />
            <p className="text-white/30 text-sm">No appointments yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentApts.map((apt) => {
              const s = statusCfg[apt.status] ?? statusCfg.pending
              return (
                <div key={apt.id} className="flex items-center gap-3 px-4 py-3.5">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-xs font-bold text-gold-400 flex-shrink-0">
                    {apt.customer_name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium truncate">{apt.customer_name}</span>
                      <Badge className={`text-[10px] px-1.5 py-0 border flex-shrink-0 ${s.className}`}>
                        {s.label}
                      </Badge>
                    </div>
                    <div className="text-white/35 text-xs mt-0.5 truncate">
                      {apt.service_name} · {fmtDate(apt.date)} {fmt12h(apt.time)}
                      {apt.total_price ? ` · $${apt.total_price}` : ''}
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-white/25 hover:text-white transition-colors p-1 flex-shrink-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-charcoal-900 border-white/10 text-white min-w-40">
                      {apt.status !== 'completed' && (
                        <DropdownMenuItem className="gap-2 text-emerald-400 focus:text-emerald-300 focus:bg-emerald-500/10 cursor-pointer" onClick={() => updateStatus(apt.id, 'completed')}>
                          <CheckCircle className="w-4 h-4" /> Complete
                        </DropdownMenuItem>
                      )}
                      {apt.status !== 'confirmed' && apt.status !== 'completed' && apt.status !== 'cancelled' && (
                        <DropdownMenuItem className="gap-2 text-blue-400 focus:text-blue-300 focus:bg-blue-500/10 cursor-pointer" onClick={() => updateStatus(apt.id, 'confirmed')}>
                          <CheckCircle className="w-4 h-4" /> Confirm
                        </DropdownMenuItem>
                      )}
                      {apt.status !== 'cancelled' && (
                        <DropdownMenuItem className="gap-2 text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer" onClick={() => updateStatus(apt.id, 'cancelled')}>
                          <XCircle className="w-4 h-4" /> Cancel
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild className="h-12">
          <Link href="/booking"><Plus className="w-4 h-4" />New Booking</Link>
        </Button>
        <Button variant="secondary" asChild className="h-12">
          <Link href="/admin/availability">Block Date</Link>
        </Button>
      </div>
    </div>
  )
}
