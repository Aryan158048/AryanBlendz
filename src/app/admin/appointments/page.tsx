'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Search, Plus, Calendar, Filter, Loader2, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { adminGetAppointments, adminUpdateAppointmentStatus } from '@/app/actions/admin'
import type { AppointmentStatus } from '@/types'

function fmt12h(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}
function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

type Appointment = {
  id: string
  date: string
  time: string
  status: AppointmentStatus
  confirmation_code: string
  total_price: number | null
  customer_name: string
  customer_email: string
  service_name: string
}

const statusCfg: Record<AppointmentStatus, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  completed: { label: 'Completed', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  no_show:   { label: 'No Show',   className: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchAppointments = useCallback(async () => {
    try {
      const data = await adminGetAppointments()
      setAppointments(data.map((a: any) => ({
        id:                a.id,
        date:              a.date,
        time:              a.time,
        status:            a.status,
        confirmation_code: a.confirmation_code,
        total_price:       a.total_price,
        customer_name:     a.customers?.name  ?? 'Unknown',
        customer_email:    a.customers?.email ?? '',
        service_name:      a.services?.name   ?? 'Unknown',
      })))
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
    const matchSearch = !q ||
      a.customer_name.toLowerCase().includes(q) ||
      a.service_name.toLowerCase().includes(q) ||
      a.confirmation_code.toLowerCase().includes(q)
    return matchSearch && (statusFilter === 'all' || a.status === statusFilter)
  })

  const today = new Date().toISOString().split('T')[0]
  const stats = {
    today:     appointments.filter((a) => a.date === today).length,
    pending:   appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    total:     appointments.length,
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Appointments</h2>
          <p className="text-white/35 text-xs mt-0.5">All bookings</p>
        </div>
        <Button size="sm" className="h-8" asChild>
          <Link href="/booking"><Plus className="w-4 h-4" /><span className="hidden sm:inline">New</span></Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Today's", value: stats.today,     color: 'text-gold-400'   },
          { label: 'Pending', value: stats.pending,   color: 'text-yellow-400' },
          { label: 'Confirm', value: stats.confirmed, color: 'text-blue-400'   },
          { label: 'Total',   value: stats.total,     color: 'text-white'      },
        ].map((s) => (
          <div key={s.label} className="glass gold-border rounded-xl p-3 text-center">
            <div className={`font-display text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-white/35 text-[10px] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <Input
            placeholder="Search name, service, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-charcoal-900 border-white/10 text-white placeholder:text-white/25 focus:border-gold-500/50 h-9 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-28 sm:w-36 bg-charcoal-900 border-white/10 text-white h-9 text-xs">
            <Filter className="w-3 h-3 text-white/40 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-charcoal-900 border-white/10 text-white">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no_show">No Show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="glass gold-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gold-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar className="w-8 h-8 text-white/15 mx-auto mb-2" />
            <p className="text-white/35 text-sm">
              {appointments.length === 0 ? 'No appointments yet' : 'No results'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((apt) => {
              const s = statusCfg[apt.status]
              return (
                <div key={apt.id} className="flex items-center gap-3 px-4 py-3.5">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-sm font-bold text-gold-400 flex-shrink-0">
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
                    <div className="text-white/40 text-xs mt-0.5 truncate">{apt.service_name}</div>
                    <div className="text-white/25 text-xs mt-0.5">
                      {fmtDate(apt.date)} · {fmt12h(apt.time)}
                      {apt.total_price ? ` · $${apt.total_price}` : ''}
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-white/25 hover:text-white p-1.5 flex-shrink-0 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-charcoal-900 border-white/10 text-white min-w-40">
                      {apt.status !== 'confirmed' && apt.status !== 'completed' && apt.status !== 'cancelled' && (
                        <DropdownMenuItem className="gap-2 text-blue-400 focus:bg-blue-500/10 cursor-pointer" onClick={() => updateStatus(apt.id, 'confirmed')}>
                          <CheckCircle className="w-4 h-4" /> Confirm
                        </DropdownMenuItem>
                      )}
                      {apt.status !== 'completed' && (
                        <DropdownMenuItem className="gap-2 text-emerald-400 focus:bg-emerald-500/10 cursor-pointer" onClick={() => updateStatus(apt.id, 'completed')}>
                          <CheckCircle className="w-4 h-4" /> Complete
                        </DropdownMenuItem>
                      )}
                      {apt.status !== 'no_show' && (
                        <DropdownMenuItem className="gap-2 text-gray-400 focus:bg-gray-500/10 cursor-pointer" onClick={() => updateStatus(apt.id, 'no_show')}>
                          No-Show
                        </DropdownMenuItem>
                      )}
                      {apt.status !== 'cancelled' && (
                        <DropdownMenuItem className="gap-2 text-red-400 focus:bg-red-500/10 cursor-pointer" onClick={() => updateStatus(apt.id, 'cancelled')}>
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

      <p className="text-white/20 text-xs text-center">
        {filtered.length} of {appointments.length} appointments
      </p>
    </div>
  )
}
