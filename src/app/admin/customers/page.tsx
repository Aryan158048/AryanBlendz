'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, User, Phone, Mail, Calendar, ChevronRight, X, Scissors, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { getInitials, formatDate, formatCurrency } from '@/lib/utils'
import { adminGetCustomers, adminGetCustomerAppointments, adminSaveCustomerNotes } from '@/app/actions/admin'
import type { AppointmentStatus } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

type Customer = {
  id: string
  name: string
  email: string
  phone: string | null
  notes: string | null
  total_visits: number
  last_visit: string | null
  created_at: string
}

type CustomerAppointment = {
  id: string
  service_name: string
  appointment_date: string
  total_price: number | null
  status: AppointmentStatus
}

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  completed: { label: 'Completed', className: 'bg-green-500/15 text-green-400 border-green-500/30' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  no_show:   { label: 'No Show',   className: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const [customers, setCustomers]         = useState<Customer[]>([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [selected, setSelected]           = useState<Customer | null>(null)
  const [notesValue, setNotesValue]       = useState('')
  const [savingNotes, setSavingNotes]     = useState(false)
  const [apts, setApts]                   = useState<CustomerAppointment[]>([])
  const [aptsLoading, setAptsLoading]     = useState(false)

  const fetchCustomers = useCallback(async () => {
    try {
      const data = await adminGetCustomers()
      setCustomers(data)
    } catch {
      toast.error('Failed to load customers')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const openCustomer = async (c: Customer) => {
    setSelected(c)
    setNotesValue(c.notes ?? '')
    setApts([])
    setAptsLoading(true)
    try {
      const data = await adminGetCustomerAppointments(c.id)
      setApts(
        data.map((a: any) => ({
          id:               a.id,
          service_name:     a.services?.name ?? 'Unknown',
          appointment_date: a.appointment_date,
          total_price:      a.total_price,
          status:           a.status,
        }))
      )
    } catch {
      toast.error('Failed to load appointment history')
    }
    setAptsLoading(false)
  }

  const saveNotes = async () => {
    if (!selected) return
    setSavingNotes(true)
    try {
      await adminSaveCustomerNotes(selected.id, notesValue)
      setCustomers((prev) => prev.map((c) => c.id === selected.id ? { ...c, notes: notesValue } : c))
      setSelected((prev) => prev ? { ...prev, notes: notesValue } : prev)
      toast.success('Notes saved')
    } catch {
      toast.error('Failed to save notes')
    }
    setSavingNotes(false)
  }

  const filtered = customers.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone ?? '').includes(q)
    )
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Customers</h2>
          <p className="text-white/40 text-sm mt-1">
            {loading ? '—' : `${customers.length} total customers`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <Input
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-charcoal-900 border-white/10 text-white placeholder:text-white/25 focus:border-gold-500/50 h-10"
        />
      </div>

      <div className={`flex gap-5 ${selected ? 'items-start' : ''}`}>
        {/* Table */}
        <div className={`glass gold-border rounded-2xl overflow-hidden ${selected ? 'flex-1 min-w-0' : 'w-full'}`}>
          <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-3 px-5 py-3 border-b border-white/8 text-xs font-medium text-white/40 uppercase tracking-wide">
            <div>Customer</div>
            <div>Contact</div>
            <div>Visits</div>
            <div>Last Visit</div>
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
                  <User className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">
                    {customers.length === 0 ? 'No customers yet' : 'No results found'}
                  </p>
                </div>
              ) : (
                filtered.map((customer) => (
                  <div
                    key={customer.id}
                    className={`grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_auto] gap-1.5 md:gap-3 px-5 py-3.5 cursor-pointer transition-colors items-center ${
                      selected?.id === customer.id
                        ? 'bg-gold-500/5 border-l-2 border-l-gold-500/40'
                        : 'hover:bg-white/2'
                    }`}
                    onClick={() => openCustomer(customer)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-gold text-charcoal-950 text-xs font-bold">
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-white text-sm font-medium">{customer.name}</div>
                        <div className="text-white/30 text-xs md:hidden">{customer.email}</div>
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <div className="text-white/60 text-sm truncate">{customer.email}</div>
                      <div className="text-white/30 text-xs">{customer.phone ?? '—'}</div>
                    </div>
                    <div className="hidden md:block">
                      <span className="text-gold-400 font-semibold">{customer.total_visits}</span>
                      <span className="text-white/30 text-xs ml-1">visits</span>
                    </div>
                    <div className="hidden md:block text-white/50 text-sm">
                      {customer.last_visit ? formatDate(customer.last_visit, 'MMM d, yyyy') : '—'}
                    </div>
                    <div className="hidden md:block">
                      <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-80 flex-shrink-0 glass gold-border rounded-2xl overflow-hidden animate-slide-up">
            <div className="p-5 border-b border-white/8">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-white">Customer Details</h3>
                <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-gradient-gold text-charcoal-950 font-bold font-display">
                    {getInitials(selected.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-white font-semibold">{selected.name}</div>
                  <div className="text-white/40 text-xs">
                    Since {formatDate(selected.created_at.split('T')[0], 'MMM yyyy')}
                  </div>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-3.5 h-3.5 text-white/30" />
                  <span className="text-white/60 truncate">{selected.email}</span>
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-white/60">{selected.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Scissors className="w-3.5 h-3.5 text-gold-400/50" />
                  <span className="text-gold-400 font-semibold">{selected.total_visits}</span>
                  <span className="text-white/40">total visits</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="p-5 border-b border-white/8">
              <Label className="text-white/60 text-xs uppercase tracking-wide mb-2 block">Notes</Label>
              <Textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                placeholder="Add notes about this customer..."
                rows={3}
                className="bg-charcoal-900/50 border-white/10 text-white placeholder:text-white/20 text-sm resize-none mb-2"
              />
              <Button size="sm" className="w-full h-8 text-xs" onClick={saveNotes} disabled={savingNotes}>
                {savingNotes ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</> : 'Save Notes'}
              </Button>
            </div>

            {/* Appointment history */}
            <div className="p-5">
              <Label className="text-white/60 text-xs uppercase tracking-wide mb-3 block">
                Appointment History
              </Label>
              {aptsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-4 h-4 text-gold-400 animate-spin" />
                </div>
              ) : apts.length === 0 ? (
                <p className="text-white/30 text-xs text-center py-4">No appointments on record</p>
              ) : (
                <div className="space-y-2">
                  {apts.map((apt) => {
                    const s = statusConfig[apt.status]
                    return (
                      <div key={apt.id} className="bg-charcoal-900/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-xs font-medium truncate flex-1 mr-2">
                            {apt.service_name}
                          </span>
                          <Badge className={`text-[10px] px-1.5 py-0.5 border flex-shrink-0 ${s.className}`}>
                            {s.label}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/40 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(apt.appointment_date, 'MMM d, yyyy')}
                          </span>
                          {apt.total_price && (
                            <span className="text-gold-400/70 font-medium">
                              {formatCurrency(apt.total_price)}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
