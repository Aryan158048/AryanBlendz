'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Search,
  Plus,
  MoreHorizontal,
  ChevronDown,
  Calendar,
  Filter,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import type { AppointmentStatus } from '@/types'

type MockAppointment = {
  id: string
  customer: string
  email: string
  service: string
  barber: string
  date: string
  time: string
  status: AppointmentStatus
  price: number
  code: string
}

const MOCK_APPOINTMENTS: MockAppointment[] = [
  { id: '1',  customer: 'Jordan Williams',  email: 'jordan@example.com',  service: 'Haircut + Beard Combo',      barber: 'Aryan',   date: '2026-03-25', time: '09:00', status: 'confirmed',  price: 55,  code: 'AB-X7K2' },
  { id: '2',  customer: 'Marcus Brown',     email: 'marcus@example.com',  service: 'Classic Haircut',            barber: 'Marcus',  date: '2026-03-25', time: '10:00', status: 'completed',  price: 35,  code: 'AB-M3P9' },
  { id: '3',  customer: 'Deshawn Carter',   email: 'deshawn@example.com', service: 'Premium Grooming Package',   barber: 'Jerome',  date: '2026-03-25', time: '11:00', status: 'confirmed',  price: 75,  code: 'AB-D4R8' },
  { id: '4',  customer: 'Chris Okonkwo',    email: 'chris@example.com',   service: 'Lineup / Edge Up',           barber: 'Darius',  date: '2026-03-25', time: '12:30', status: 'pending',    price: 20,  code: 'AB-C5T1' },
  { id: '5',  customer: 'Malik Thompson',   email: 'malik@example.com',   service: 'Beard Trim & Shape',         barber: 'Aryan',   date: '2026-03-26', time: '09:30', status: 'pending',    price: 25,  code: 'AB-M6Q7' },
  { id: '6',  customer: 'Kevin James',      email: 'kevin@example.com',   service: 'Classic Haircut',            barber: 'Marcus',  date: '2026-03-26', time: '11:00', status: 'confirmed',  price: 35,  code: 'AB-K9W3' },
  { id: '7',  customer: 'Tyrone Jackson',   email: 'tyrone@example.com',  service: 'Kids Cut (12 & Under)',      barber: 'Jerome',  date: '2026-03-26', time: '14:00', status: 'confirmed',  price: 25,  code: 'AB-T2E5' },
  { id: '8',  customer: 'Alex Chen',        email: 'alex@example.com',    service: 'Haircut + Beard Combo',      barber: 'Aryan',   date: '2026-03-27', time: '10:00', status: 'cancelled',  price: 55,  code: 'AB-A3F6' },
  { id: '9',  customer: 'David Kim',        email: 'david@example.com',   service: 'Beard Trim & Shape',         barber: 'Darius',  date: '2026-03-27', time: '13:00', status: 'no_show',    price: 25,  code: 'AB-D8H4' },
  { id: '10', customer: 'Sofia Rodriguez',  email: 'sofia@example.com',   service: 'Premium Grooming Package',   barber: 'Jerome',  date: '2026-03-28', time: '15:00', status: 'pending',    price: 75,  code: 'AB-S1P2' },
  { id: '11', customer: 'Ryan Foster',      email: 'ryan@example.com',    service: 'Classic Haircut',            barber: 'Marcus',  date: '2026-03-28', time: '16:00', status: 'confirmed',  price: 35,  code: 'AB-R9N7' },
  { id: '12', customer: 'Omar Hassan',      email: 'omar@example.com',    service: 'Lineup / Edge Up',           barber: 'Aryan',   date: '2026-03-29', time: '09:00', status: 'pending',    price: 20,  code: 'AB-O5M3' },
]

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  completed: { label: 'Completed', className: 'bg-green-500/15 text-green-400 border-green-500/30' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  no_show:   { label: 'No Show',   className: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<MockAppointment[]>(MOCK_APPOINTMENTS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [barberFilter, setBarberFilter] = useState<string>('all')

  const updateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    )
    toast.success(`Appointment marked as ${status}`)
  }

  const filtered = appointments.filter((a) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      a.customer.toLowerCase().includes(q) ||
      a.service.toLowerCase().includes(q) ||
      a.code.toLowerCase().includes(q) ||
      a.barber.toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter
    const matchesBarber = barberFilter === 'all' || a.barber === barberFilter
    return matchesSearch && matchesStatus && matchesBarber
  })

  const stats = {
    total:     appointments.length,
    pending:   appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    today:     appointments.filter((a) => a.date === '2026-03-25').length,
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Appointments</h2>
          <p className="text-white/40 text-sm mt-1">Manage all bookings</p>
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
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
          { label: 'Confirmed', value: stats.confirmed, color: 'text-blue-400' },
          { label: "Today's", value: stats.today, color: 'text-gold-400' },
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
              placeholder="Search customer, service, code..."
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
          <Select value={barberFilter} onValueChange={setBarberFilter}>
            <SelectTrigger className="w-36 bg-charcoal-900 border-white/10 text-white h-9">
              <SelectValue placeholder="Barber" />
            </SelectTrigger>
            <SelectContent className="bg-charcoal-900 border-white/10">
              <SelectItem value="all">All Barbers</SelectItem>
              <SelectItem value="Aryan">Aryan</SelectItem>
              <SelectItem value="Marcus">Marcus</SelectItem>
              <SelectItem value="Jerome">Jerome</SelectItem>
              <SelectItem value="Darius">Darius</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="glass gold-border rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="hidden lg:grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_auto] gap-3 px-5 py-3 border-b border-white/8 text-xs font-medium text-white/40 uppercase tracking-wide">
          <div>Customer</div>
          <div>Service</div>
          <div>Barber</div>
          <div>Date</div>
          <div>Time</div>
          <div>Status</div>
          <div />
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/6">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No appointments found</p>
            </div>
          ) : (
            filtered.map((apt) => {
              const status = statusConfig[apt.status]
              return (
                <div
                  key={apt.id}
                  className="grid grid-cols-1 lg:grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_auto] gap-1.5 lg:gap-3 px-5 py-3.5 hover:bg-white/2 transition-colors items-center"
                >
                  {/* Customer */}
                  <div>
                    <div className="text-white text-sm font-medium">{apt.customer}</div>
                    <div className="text-white/30 text-xs flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono">{apt.code}</span>
                      <span className="text-white/20">·</span>
                      <span>{formatCurrency(apt.price)}</span>
                    </div>
                  </div>

                  {/* Service */}
                  <div className="text-white/70 text-sm truncate">{apt.service}</div>

                  {/* Barber */}
                  <div className="text-white/60 text-sm">{apt.barber}</div>

                  {/* Date */}
                  <div className="text-white/60 text-sm">
                    <span className="lg:hidden text-white/30 text-xs mr-1">Date:</span>
                    {formatDate(apt.date, 'MMM d, yyyy')}
                  </div>

                  {/* Time */}
                  <div className="text-white/60 text-sm">
                    <span className="lg:hidden text-white/30 text-xs mr-1">Time:</span>
                    {formatTime(apt.time)}
                  </div>

                  {/* Status */}
                  <div>
                    <Badge className={`text-xs px-2 py-0.5 border ${status.className}`}>
                      {status.label}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-charcoal-900 border-white/10 w-44" align="end">
                        <DropdownMenuItem className="text-white/70 hover:text-white focus:text-white focus:bg-white/5 cursor-pointer">
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-white/70 hover:text-white focus:text-white focus:bg-white/5 cursor-pointer">
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/8" />
                        {apt.status !== 'completed' && (
                          <DropdownMenuItem
                            className="text-green-400 focus:text-green-400 focus:bg-green-500/10 cursor-pointer"
                            onClick={() => updateStatus(apt.id, 'completed')}
                          >
                            Mark Complete
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
                        {apt.status !== 'no_show' && (
                          <DropdownMenuItem
                            className="text-gray-400 focus:text-gray-400 focus:bg-gray-500/10 cursor-pointer"
                            onClick={() => updateStatus(apt.id, 'no_show')}
                          >
                            Mark No-Show
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
      </div>

      <p className="text-white/30 text-xs text-center">
        Showing {filtered.length} of {appointments.length} appointments
      </p>
    </div>
  )
}
