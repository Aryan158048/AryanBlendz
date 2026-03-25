'use client'

import {
  Calendar,
  DollarSign,
  Users,
  Star,
  Plus,
  Ban,
  Scissors,
  Clock,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatsCard } from '@/components/admin/StatsCard'
import { AppointmentStatusBadge } from '@/components/admin/AppointmentStatusBadge'
import type { AppointmentStatus } from '@/types'

const statsCards = [
  {
    title: "Today's Appointments",
    value: '8',
    trend: '+2',
    trendUp: true,
    icon: Calendar,
    description: 'vs yesterday',
  },
  {
    title: "This Week's Revenue",
    value: '$487',
    trend: '+12%',
    trendUp: true,
    icon: DollarSign,
    description: 'vs last week',
  },
  {
    title: 'Total Customers',
    value: '142',
    trend: '+5',
    trendUp: true,
    icon: Users,
    description: 'new this month',
  },
  {
    title: 'Avg Rating',
    value: '4.9',
    trend: '+0.1',
    trendUp: true,
    icon: Star,
    description: 'from 89 reviews',
  },
]

type ScheduleStatus = 'completed' | 'confirmed' | 'pending'

const todaySchedule: {
  id: string
  customer: string
  service: string
  time: string
  barber: string
  status: ScheduleStatus
}[] = [
  { id: '1', customer: 'Jordan Williams', service: 'Haircut + Beard Combo', time: '09:00 AM', barber: 'Aryan', status: 'completed' },
  { id: '2', customer: 'Marcus Brown', service: 'Classic Haircut', time: '10:00 AM', barber: 'Marcus', status: 'completed' },
  { id: '3', customer: 'Deshawn Carter', service: 'Premium Grooming Package', time: '11:00 AM', barber: 'Jerome', status: 'confirmed' },
  { id: '4', customer: 'Chris Okonkwo', service: 'Lineup / Edge Up', time: '12:30 PM', barber: 'Darius', status: 'confirmed' },
  { id: '5', customer: 'Malik Thompson', service: 'Beard Trim & Shape', time: '02:00 PM', barber: 'Aryan', status: 'pending' },
  { id: '6', customer: 'Kevin James', service: 'Classic Haircut', time: '03:30 PM', barber: 'Marcus', status: 'pending' },
]

const recentAppointments: {
  id: string
  customer: string
  service: string
  barber: string
  time: string
  date: string
  status: AppointmentStatus
}[] = [
  { id: 'AB-7829', customer: 'Marcus Johnson', service: 'Classic Haircut', barber: 'Aryan', date: 'Today', time: '10:00 AM', status: 'confirmed' },
  { id: 'AB-4521', customer: 'James Carter', service: 'Beard Trim & Shape', barber: 'Marcus', date: 'Today', time: '11:30 AM', status: 'confirmed' },
  { id: 'AB-9032', customer: 'Devon Williams', service: 'Haircut + Beard Combo', barber: 'Jordan', date: 'Today', time: '1:00 PM', status: 'pending' },
  { id: 'AB-3345', customer: 'Alex Thompson', service: 'Premium Package', barber: 'Aryan', date: 'Tomorrow', time: '9:00 AM', status: 'confirmed' },
  { id: 'AB-6677', customer: 'Ryan Davis', service: 'Lineup / Edge Up', barber: 'Marcus', date: 'Tomorrow', time: '3:30 PM', status: 'pending' },
  { id: 'AB-2210', customer: 'Tyler Brooks', service: 'Kids Cut', barber: 'Jordan', date: 'Dec 28', time: '11:00 AM', status: 'completed' },
]

const recentActivity = [
  { customer: 'Jordan Williams', action: 'Booked appointment', time: '5 min ago', service: 'Haircut + Beard' },
  { customer: 'Sofia Rodriguez', action: 'Cancelled appointment', time: '22 min ago', service: 'Classic Haircut' },
  { customer: 'Tyrone Jackson', action: 'Booked appointment', time: '1 hr ago', service: 'Premium Package' },
  { customer: 'Alex Chen', action: 'Completed visit', time: '2 hrs ago', service: 'Beard Trim' },
  { customer: 'David Kim', action: 'Booked appointment', time: '3 hrs ago', service: 'Kids Cut' },
]

const scheduleStatusConfig: Record<ScheduleStatus, { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  pending:   { label: 'Pending',   className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  completed: { label: 'Completed', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getTodayDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">
            {getGreeting()}, Aryan
          </h2>
          <p className="text-white/40 text-sm mt-1">{getTodayDate()}</p>
        </div>
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Shop is open
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <StatsCard key={card.title} {...card} />
        ))}
      </div>

      {/* Recent Appointments table */}
      <div className="glass gold-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div>
            <h3 className="font-display text-lg font-bold text-white">Recent Appointments</h3>
            <p className="text-white/40 text-xs mt-0.5">Latest bookings across all barbers</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/appointments">View All</Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-semibold text-white/30 uppercase tracking-wider px-5 py-3">Customer</th>
                <th className="text-left text-xs font-semibold text-white/30 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Service</th>
                <th className="text-left text-xs font-semibold text-white/30 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Barber</th>
                <th className="text-left text-xs font-semibold text-white/30 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Time</th>
                <th className="text-left text-xs font-semibold text-white/30 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-white/30 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-xs font-bold text-gold-400 font-display flex-shrink-0">
                        {apt.customer.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{apt.customer}</div>
                        <div className="text-white/30 text-xs font-mono">{apt.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-white/60 text-sm">{apt.service}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-white/60 text-sm">{apt.barber}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <div className="text-white/60 text-sm">{apt.date}</div>
                    <div className="text-white/30 text-xs">{apt.time}</div>
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
                        <DropdownMenuItem className="gap-2 text-white/70 focus:text-white focus:bg-white/5 cursor-pointer">
                          <Eye className="w-4 h-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/8" />
                        <DropdownMenuItem className="gap-2 text-emerald-400 focus:text-emerald-300 focus:bg-emerald-500/10 cursor-pointer">
                          <CheckCircle className="w-4 h-4" /> Complete
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer">
                          <XCircle className="w-4 h-4" /> Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Today's schedule */}
        <div className="xl:col-span-2 glass gold-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                Today&apos;s Schedule
              </h3>
              <p className="text-white/40 text-xs mt-0.5">
                {todaySchedule.length} appointments
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/appointments">View Schedule</Link>
            </Button>
          </div>

          <div className="space-y-2">
            {todaySchedule.map((apt) => {
              const status = scheduleStatusConfig[apt.status]
              return (
                <div
                  key={apt.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-charcoal-900/60 hover:bg-charcoal-900 transition-colors"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-gold-500/50 flex-shrink-0" />
                  <div className="flex items-center gap-1.5 flex-shrink-0 w-20">
                    <Clock className="w-3 h-3 text-white/25" />
                    <span className="text-white/50 text-xs font-mono">{apt.time}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{apt.customer}</div>
                    <div className="text-white/35 text-xs truncate">{apt.service} · {apt.barber}</div>
                  </div>
                  <Badge className={`text-[10px] px-2 py-0.5 border flex-shrink-0 ${status.className}`}>
                    {status.label}
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar: Quick actions + Recent activity */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="glass gold-border rounded-2xl p-5">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button className="w-full justify-start" asChild>
                <Link href="/booking">
                  <Plus className="w-4 h-4" />
                  New Appointment
                </Link>
              </Button>
              <Button variant="secondary" className="w-full justify-start" asChild>
                <Link href="/admin/availability">
                  <Ban className="w-4 h-4" />
                  Block Date
                </Link>
              </Button>
              <Button variant="secondary" className="w-full justify-start" asChild>
                <Link href="/admin/services">
                  <Scissors className="w-4 h-4" />
                  Add Service
                </Link>
              </Button>
              <Button variant="secondary" className="w-full justify-start" asChild>
                <Link href="/admin/appointments">
                  <Calendar className="w-4 h-4" />
                  Today&apos;s Schedule
                </Link>
              </Button>
            </div>
          </div>

          {/* Recent activity */}
          <div className="glass gold-border rounded-2xl p-5">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.map((activity, i) => (
                <div key={i}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gold-400 font-display mt-0.5">
                      {activity.customer.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">
                        {activity.customer}
                      </p>
                      <p className="text-white/40 text-xs">
                        {activity.action}
                      </p>
                      <p className="text-white/25 text-xs mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                  {i < recentActivity.length - 1 && (
                    <Separator className="bg-white/5 mt-3" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
