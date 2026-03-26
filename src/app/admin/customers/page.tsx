'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, User, Phone, Mail, Calendar, X, Scissors, Loader2, ChevronRight } from 'lucide-react'
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

type Customer = {
  id: string; name: string; email: string; phone: string | null
  notes: string | null; total_visits: number; last_visit: string | null; created_at: string
}
type CustomerAppointment = {
  id: string; service_name: string; appointment_date: string
  total_price: number | null; status: AppointmentStatus
}

const statusCfg: Record<AppointmentStatus, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  completed: { label: 'Completed', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  no_show:   { label: 'No Show',   className: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
}

function DetailPanel({
  customer, onClose, apts, aptsLoading,
  notesValue, setNotesValue, onSaveNotes, savingNotes,
}: {
  customer: Customer; onClose: () => void
  apts: CustomerAppointment[]; aptsLoading: boolean
  notesValue: string; setNotesValue: (v: string) => void
  onSaveNotes: () => void; savingNotes: boolean
}) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/8 flex-shrink-0">
        <h3 className="font-display text-base font-bold text-white">Customer Details</h3>
        <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-white/8">
        {/* Profile */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarFallback className="bg-gradient-gold text-charcoal-950 font-bold font-display text-base">
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-white font-semibold">{customer.name}</div>
              <div className="text-white/35 text-xs">
                Since {formatDate(customer.created_at.split('T')[0], 'MMM yyyy')}
              </div>
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-sm">
              <Mail className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
              <span className="text-white/55 truncate">{customer.email}</span>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-2.5 text-sm">
                <Phone className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
                <span className="text-white/55">{customer.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-sm">
              <Scissors className="w-3.5 h-3.5 text-gold-400/50 flex-shrink-0" />
              <span className="text-gold-400 font-semibold">{customer.total_visits}</span>
              <span className="text-white/35">total visits</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="px-4 py-4">
          <Label className="text-white/40 text-xs uppercase tracking-wide mb-2 block">Notes</Label>
          <Textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            placeholder="Add notes..."
            rows={3}
            className="bg-charcoal-900/50 border-white/10 text-white placeholder:text-white/20 text-sm resize-none mb-2"
          />
          <Button size="sm" className="w-full h-9 text-xs" onClick={onSaveNotes} disabled={savingNotes}>
            {savingNotes ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</> : 'Save Notes'}
          </Button>
        </div>

        {/* History */}
        <div className="px-4 py-4">
          <Label className="text-white/40 text-xs uppercase tracking-wide mb-3 block">Appointment History</Label>
          {aptsLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 text-gold-400 animate-spin" /></div>
          ) : apts.length === 0 ? (
            <p className="text-white/25 text-xs text-center py-4">No appointments on record</p>
          ) : (
            <div className="space-y-2">
              {apts.map((apt) => {
                const s = statusCfg[apt.status]
                return (
                  <div key={apt.id} className="bg-charcoal-900/60 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-medium truncate flex-1 mr-2">{apt.service_name}</span>
                      <Badge className={`text-[10px] px-1.5 py-0 border flex-shrink-0 ${s.className}`}>{s.label}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/35 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(apt.appointment_date, 'MMM d, yyyy')}
                      </span>
                      {apt.total_price && (
                        <span className="text-gold-400/70 font-medium">{formatCurrency(apt.total_price)}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CustomersPage() {
  const [customers, setCustomers]     = useState<Customer[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [selected, setSelected]       = useState<Customer | null>(null)
  const [notesValue, setNotesValue]   = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [apts, setApts]               = useState<CustomerAppointment[]>([])
  const [aptsLoading, setAptsLoading] = useState(false)

  const fetchCustomers = useCallback(async () => {
    try { setCustomers(await adminGetCustomers()) }
    catch { toast.error('Failed to load customers') }
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
      setApts(data.map((a: any) => ({
        id:               a.id,
        service_name:     a.services?.name ?? 'Unknown',
        appointment_date: a.date,
        total_price:      a.total_price,
        status:           a.status,
      })))
    } catch { toast.error('Failed to load history') }
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
    } catch { toast.error('Failed to save') }
    setSavingNotes(false)
  }

  const filtered = customers.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.phone ?? '').includes(q)
  })

  const detailProps = {
    apts, aptsLoading, notesValue, setNotesValue,
    onSaveNotes: saveNotes, savingNotes,
    onClose: () => setSelected(null),
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-bold text-white">Customers</h2>
        <p className="text-white/35 text-xs mt-0.5">{loading ? '—' : `${customers.length} total`}</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
        <Input
          placeholder="Search name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-charcoal-900 border-white/10 text-white placeholder:text-white/25 focus:border-gold-500/50 h-10 text-sm"
        />
      </div>

      {/* Two-panel layout on desktop, list-only on mobile */}
      <div className="flex gap-4 items-start">
        {/* List */}
        <div className={`glass gold-border rounded-2xl overflow-hidden ${selected ? 'hidden lg:block lg:flex-1' : 'w-full'}`}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-gold-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <User className="w-8 h-8 text-white/15 mx-auto mb-2" />
              <p className="text-white/35 text-sm">{customers.length === 0 ? 'No customers yet' : 'No results found'}</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => openCustomer(customer)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                    selected?.id === customer.id
                      ? 'bg-gold-500/8 border-l-2 border-l-gold-500/40'
                      : 'hover:bg-white/2 active:bg-white/4'
                  }`}
                >
                  <Avatar className="w-9 h-9 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-gold text-charcoal-950 text-xs font-bold">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{customer.name}</div>
                    <div className="text-white/35 text-xs truncate">{customer.email}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-gold-400 text-xs font-semibold">{customer.total_visits}x</span>
                    <ChevronRight className="w-3.5 h-3.5 text-white/20" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop side panel */}
        {selected && (
          <div className="hidden lg:flex w-80 flex-shrink-0 glass gold-border rounded-2xl overflow-hidden flex-col max-h-[calc(100vh-8rem)]">
            <DetailPanel customer={selected} {...detailProps} />
          </div>
        )}
      </div>

      {/* Mobile full-screen modal */}
      {selected && (
        <div className="lg:hidden fixed inset-0 z-50 bg-charcoal-950 flex flex-col pb-safe-16">
          <DetailPanel customer={selected} {...detailProps} />
        </div>
      )}
    </div>
  )
}
