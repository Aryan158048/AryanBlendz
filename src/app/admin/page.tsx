'use client'

import { useState, useEffect } from 'react'
import {
  Calendar, DollarSign, Users, Star, Plus, Ban,
  Scissors, Clock, MoreHorizontal, CheckCircle, XCircle, Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatsCard } from '@/components/admin/StatsCard'
import { AppointmentStatusBadge } from '@/components/admin/AppointmentStatusBadge'
import { adminGetDashboardData, adminUpdateAppointmentStatus } from '@/app/actions/admin'
import { toast } from 'sonner'
import type { AppointmentStatus } from '@/types'

function fmt12h(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getTodayDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

const scheduleStatusConfig = {
  confirmed: { label: 'Confirmed', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  pending:   { label: 'Pending',   className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  completed: { label: 'Done',      className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
} as const

type ScheduleAppt = { id: string; start_time: string; status: string; customer_name: string; service_name: string }
type RecentAppt   = { id: string; appointment_date: string; start_time: string; status: AppointmentStatus; confirmation_code: string; total_price: number | null; customer_name: string; service_name: string }

export default function AdminDashboard() {
  const [loading, setLoading]             = useState(true)
  const [stats, setStats]                 = useState({ today: 0, revenue: 0, customers: 0 })
  const [todaySchedule, setTodaySchedule] = useState<ScheduleAppt[]>([])
  const [recentApts, setRecentApts]       = useState<RecentAppt[]>([])
  const [activity, setActivity]           = useState<{ customer: string; action: string; time: string; service: string }[]>([])

  useEffect(() => {
    adminGetDashboardData().then((data) => {
      if (!data) { setLoading(false); return }

      setTodaySchedule(data.todayRows.map((a: any) => ({
        id:            a.id,
        start_time:    a.start_time,
        status:        a.status,
        customer_name: a.customers?.name ?? 'Unknown',
        service_name:  a.services?.name  ?? 'Unknown',
      })))

      setRecentApts(data.recentRows.map((a: any) => ({
        id:                a.id,
        appointment_date:  a.appointment_date,
        start_time:        a.start_time,
        status:            a.status,
        confirmation_code: a.confirmation_code,
        total_price:       a.total_price,
        customer_name:     a.customers?.name ?? 'Unknown',
        service_name:      a.services?.name  ?? 'Unknown',
      })))

      setActivity(data.recentRows.slice(0, 5).map((a: any) => ({
        customer: a.customers?.name ?? 'Unknown',
        action:
          a.status === 'cancelled' ? 'Cancelled appointment' :
          a.status === 'completed' ? 'Completed visit' :
          'Booked appointment',
        time: new Date(a.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        service: a.services?.name ?? '',
      })))

      setStats({ today: data.todayCount, revenue: data.weekRevTotal, customers: data.custCount })
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

  const statsCards = [
    { title: "Today's Appointments", value: String(stats.today),              trendUp: true, icon: Calendar,     description: 'scheduled today' },
    { title: "This Week's Revenue",  value: `$${stats.revenue.toFixed(0)}`,   trendUp: true, icon: DollarSign,  description: 'from completed bookings' },
    { title: 'Total Customers',      value: String(stats.customers),           trendUp: true, icon: Users,       description: 'all time' },
    { title: 'Avg Rating',           value: '4.9',                             trendUp: true, icon: Star,        description: 'from reviews' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">{getGreeting()}, Aryan</h2>
          <p className="text-white/40 text-sm mt-1">{getTodayDate()}</p>
        </div>
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Taking bookings
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((card) => <StatsCard key={card.title} {...card} trend="" />)}
      </div>

      {/* Recent Appointments */}
      <div className="glass gold-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div>
            <h3 className="font-display text-lg font-bold text-white">Recent Appointments</h3>
            <p className="text-white/40 text-xs mt-0.5">Your latest bookings</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/appointments">View All</Link>
          </Button>
        </div>

        {recentApts.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No appointments yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-semibold text-white/30 uppercase tracking-wider px-5 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-white/30 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Service</th>
                  <th className="text-left text-xs font-semibold text-white/30 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Date / Time</th>
                  <th className="text-left text-xs font-semibold text-white/30 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-white/30 uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentApts.map((apt) => (
                  <tr key={apt.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-xs font-bold text-gold-400 font-display flex-shrink-0">
                          {apt.customer_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">{apt.customer_name}</div>
                          <div className="text-white/30 text-xs font-mono">{apt.confirmation_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="text-white/60 text-sm">{apt.service_name}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="text-white/60 text-sm">
                        {new Date(apt.appointment_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-white/30 text-xs">{fmt12h(apt.start_time)}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <AppointmentStatusBadge status={apt.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/30 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-charcoal-900 border-white/10 text-white min-w-44">
                          <DropdownMenuSeparator className="bg-white/8" />
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Today's schedule */}
        <div className="xl:col-span-2 glass gold-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-lg font-bold text-white">Today&apos;s Schedule</h3>
              <p className="text-white/40 text-xs mt-0.5">{todaySchedule.length} appointment{todaySchedule.length !== 1 ? 's' : ''}</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/appointments">View All</Link>
            </Button>
          </div>

          {todaySchedule.length === 0 ? (
            <div className="py-10 text-center">
              <Calendar className="w-10 h-10 text-white/15 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Nothing scheduled for today</p>
              <Button size="sm" variant="outline" className="mt-4" asChild>
                <Link href="/booking">+ New Booking</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {todaySchedule.map((apt) => {
                const status = scheduleStatusConfig[apt.status as keyof typeof scheduleStatusConfig] ?? scheduleStatusConfig.pending
                return (
                  <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl bg-charcoal-900/60 hover:bg-charcoal-900 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold-500/50 flex-shrink-0" />
                    <div className="flex items-center gap-1.5 flex-shrink-0 w-20">
                      <Clock className="w-3 h-3 text-white/25" />
                      <span className="text-white/50 text-xs font-mono">{fmt12h(apt.start_time)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{apt.customer_name}</div>
                      <div className="text-white/35 text-xs truncate">{apt.service_name}</div>
                    </div>
                    <Badge className={`text-[10px] px-2 py-0.5 border flex-shrink-0 ${status.className}`}>
                      {status.label}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="glass gold-border rounded-2xl p-5">
            <h3 className="font-display text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full justify-start" asChild>
                <Link href="/booking"><Plus className="w-4 h-4" />New Appointment</Link>
              </Button>
              <Button variant="secondary" className="w-full justify-start" asChild>
                <Link href="/admin/availability"><Ban className="w-4 h-4" />Block Date</Link>
              </Button>
              <Button variant="secondary" className="w-full justify-start" asChild>
                <Link href="/admin/services"><Scissors className="w-4 h-4" />Manage Services</Link>
              </Button>
              <Button variant="secondary" className="w-full justify-start" asChild>
                <Link href="/admin/appointments"><Calendar className="w-4 h-4" />All Appointments</Link>
              </Button>
            </div>
          </div>

          <div className="glass gold-border rounded-2xl p-5">
            <h3 className="font-display text-lg font-bold text-white mb-4">Recent Activity</h3>
            {activity.length === 0 ? (
              <p className="text-white/30 text-xs text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {activity.map((a, i) => (
                  <div key={i}>
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gold-400 font-display mt-0.5">
                        {a.customer.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{a.customer}</p>
                        <p className="text-white/40 text-xs">{a.action}</p>
                        <p className="text-white/25 text-xs mt-0.5">{a.time} · {a.service}</p>
                      </div>
                    </div>
                    {i < activity.length - 1 && <Separator className="bg-white/5 mt-3" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
