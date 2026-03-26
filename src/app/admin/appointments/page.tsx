'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Search, Plus, MoreHorizontal, Calendar, Filter, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { adminGetAppointments, adminUpdateAppointmentStatus } from '@/app/actions/admin'
import type { AppointmentStatus } from '@/types'

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmt12h(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Types ────────────────────────────────────────────────────────────────────

type Appointment = {
  id: string
  appointment_date: string
  start_time: string
  status: AppointmentStatus
  confirmation_code: string
  total_price: number | null
  customer_name: string
  customer_email: string
  service_name: string
}

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  completed: { label: 'Completed', className: 'bg-green-500/15 text-green-400 border-green-500/30' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  no_show:   { label: 'No Show',   className: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchAppointments = useCallback(async () => {
    try {
      const data = await adminGetAppointments()
      setAppointments(
        data.map((a: any) => ({
          id:                a.id,
          appointment_date:  a.appointment_date,
          start_time:        a.start_time,
          status:            a.status,
          confirmation_code: a.confirmation_code,
          total_price:       a.total_price,
          customer_name:     a.customers?.name  ?? 'Unknown',
          customer_email:    a.customers?.email ?? '',
          service_name:      a.services?.name   ?? 'Unknown',
        }))
      )
    } catch {
      toast.error('Failed to load appointments')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    try {
      await adminUpdateAppointmentStatus(id, status)
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status } : a))
      toast.success(`Marked as ${status}`)
    } catch {
      toast.error('Failed to update')
    }
  }

  const filtered = appointments.filter((a) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      a.customer_name.toLowerCase().includes(q) ||
      a.service_name.toLowerCase().includes(q) ||
      a.confirmation_code.toLowerCase().includes(q) ||
      a.customer_email.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const today = new Date().toISOString().split('T')[0]
  const stats = {
    total:     appointments.length,
    pending:   appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    today:     appointments.filter((a) => a.appointment_date === today).length,
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Appointments</h2>
          <p className="text-white/40 text-sm mt-1">Manage all your bookings</p>
        </div>
        <Button asChild>
          <Link href="/booking">
            <Plus className="w-4 h-4" />
            New Appointment
          </Link>
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',     value: stats.total,     color: 'text-white'      },
          { label: 'Pending',   value: stats.pending,   color: 'text-yellow-400' },
          { label: 'Confirmed', value: stats.confirmed, color: 'text-blue-400'   },
          { label: "Today's",   value: stats.today,     color: 'text-gold-400'   },
        ].map((s) => (
          <div key={s.label} className="glass gold-border rounded-xl p-4 text-center">
            <div className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-white/40 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass gold-border rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              placeholder="Search by name, service, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-charcoal-900 border-white/10 text-white placeholder:text-white/25 focus:border-gold-500/50 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-charcoal-900 border-white/10 text-white h-9">
              <Filter className="w-3.5 h-3.5 text-white/40 mr-1.5" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-charcoal-900 border-white/10">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no_show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="glass gold-border rounded-2xl overflow-hidden">
        <div className="hidden lg:grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_auto] gap-3 px-5 py-3 border-b border-white/8 text-xs font-medium text-white/40 uppercase tracking-wide">
          <div>Customer</div>
          <div>Service</div>
          <div>Date</div>
          <div>Time</div>
          <div>Status</div>
          <div />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gold-400 animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-white/6">
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <Calendar className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">
                  {appointments.length === 0 ? 'No appointments yet' : 'No results match your filter'}
                </p>
              </div>
            ) : (
              filtered.map((apt) => {
                const status = statusConfig[apt.status]
                return (
                  <div
                    key={apt.id}
                    className="grid grid-cols-1 lg:grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_auto] gap-1.5 lg:gap-3 px-5 py-3.5 hover:bg-white/2 transition-colors items-center"
                  >
                    <div>
                      <div className="text-white text-sm font-medium">{apt.customer_name}</div>
                      <div className="text-white/30 text-xs flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono">{apt.confirmation_code}</span>
                        {apt.total_price && (
                          <>
                            <span className="text-white/20">·</span>
                            <span>${apt.total_price}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-white/70 text-sm truncate">{apt.service_name}</div>

                    <div className="text-white/60 text-sm">
                      <span className="lg:hidden text-white/30 text-xs mr-1">Date:</span>
                      {fmtDate(apt.appointment_date)}
                    </div>

                    <div className="text-white/60 text-sm">
                      <span className="lg:hidden text-white/30 text-xs mr-1">Time:</span>
                      {fmt12h(apt.start_time)}
                    </div>

                    <div>
                      <Badge className={`text-xs px-2 py-0.5 border ${status.className}`}>
                        {status.label}
                      </Badge>
                    </div>

                    <div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-charcoal-900 border-white/10 w-44" align="end">
                          <DropdownMenuSeparator className="bg-white/8" />
                          {apt.status !== 'confirmed' && apt.status !== 'completed' && apt.status !== 'cancelled' && (
                            <DropdownMenuItem
                              className="text-blue-400 focus:text-blue-400 focus:bg-blue-500/10 cursor-pointer"
                              onClick={() => updateStatus(apt.id, 'confirmed')}
                            >
                              Confirm
                            </DropdownMenuItem>
                          )}
                          {apt.status !== 'completed' && (
                            <DropdownMenuItem
                              className="text-green-400 focus:text-green-400 focus:bg-green-500/10 cursor-pointer"
                              onClick={() => updateStatus(apt.id, 'completed')}
                            >
                              Mark Complete
                            </DropdownMenuItem>
                          )}
                          {apt.status !== 'no_show' && (
                            <DropdownMenuItem
                              className="text-gray-400 focus:text-gray-400 focus:bg-gray-500/10 cursor-pointer"
                              onClick={() => updateStatus(apt.id, 'no_show')}
                            >
                              Mark No-Show
                            </DropdownMenuItem>
                          )}
                          {apt.status !== 'cancelled' && (
                            <DropdownMenuItem
                              className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                              onClick={() => updateStatus(apt.id, 'cancelled')}
                            >
                              Cancel
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      <p className="text-white/30 text-xs text-center">
        Showing {filtered.length} of {appointments.length} appointments
      </p>
    </div>
  )
}
