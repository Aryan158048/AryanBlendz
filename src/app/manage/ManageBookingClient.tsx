'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  Calendar,
  Clock,
  User,
  Scissors,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

type AppointmentData = {
  id: string
  code: string
  service: string
  barber: string
  date: string
  time: string
  price: number
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  customerName: string
  customerEmail: string
  duration: number
}

const statusConfig = {
  confirmed: { label: 'Confirmed', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  pending:   { label: 'Pending',   className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  completed: { label: 'Completed', className: 'bg-green-500/15 text-green-400 border-green-500/30' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
}

export default function ManageBookingClient() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code') ?? ''
  const [appointment, setAppointment] = useState<AppointmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)

  useEffect(() => {
    if (!code) { setLoading(false); return }

    const fetch = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id, appointment_date, start_time, status, confirmation_code, total_price,
          customers(name, email),
          services(name, duration),
          barbers(name)
        `)
        .eq('confirmation_code', code.toUpperCase())
        .single()

      if (error || !data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      const a = data as any
      setAppointment({
        id: a.id,
        code: a.confirmation_code,
        service: a.services?.name ?? 'Service',
        barber: a.barbers?.name ?? 'Aryan',
        date: a.appointment_date,
        time: a.start_time,
        price: a.total_price ?? 0,
        status: a.status,
        customerName: a.customers?.name ?? 'Guest',
        customerEmail: a.customers?.email ?? '',
        duration: a.services?.duration ?? 30,
      })
      setLoading(false)
    }

    fetch()
  }, [code])

  const handleCancel = async () => {
    if (!appointment) return
    setIsCancelling(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointment.id)

    if (error) {
      toast.error('Failed to cancel. Please try again.')
      setIsCancelling(false)
      return
    }

    setIsCancelling(false)
    setCancelOpen(false)
    setCancelled(true)
    toast.success('Appointment cancelled', {
      description: 'A confirmation email has been sent to you.',
    })
  }

  if (!code) {
    return (
      <div className="min-h-screen bg-charcoal-950 pt-24 pb-16">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="glass gold-border rounded-2xl p-10 animate-fade-in">
            <AlertCircle className="w-12 h-12 text-gold-400/60 mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-white mb-2">No Booking Code</h1>
            <p className="text-white/50 text-sm mb-6">
              Please use the link from your confirmation email to manage your booking.
            </p>
            <Button asChild><Link href="/">Back to Home</Link></Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal-950 pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
      </div>
    )
  }

  if (notFound || !appointment) {
    return (
      <div className="min-h-screen bg-charcoal-950 pt-24 pb-16">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="glass gold-border rounded-2xl p-10 animate-fade-in">
            <AlertCircle className="w-12 h-12 text-red-400/60 mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-white mb-2">Booking Not Found</h1>
            <p className="text-white/50 text-sm mb-2">
              We couldn&apos;t find an appointment with code:
            </p>
            <code className="text-gold-400 font-mono text-sm bg-gold-500/10 px-3 py-1 rounded-lg">
              {code}
            </code>
            <div className="mt-6">
              <Button asChild><Link href="/">Back to Home</Link></Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentStatus = cancelled ? 'cancelled' : appointment.status
  const status = statusConfig[currentStatus] ?? statusConfig.pending
  const canModify = !cancelled && appointment.status !== 'completed' && appointment.status !== 'cancelled'

  return (
    <main className="min-h-screen bg-charcoal-950 pt-24 pb-16">
      <div className="max-w-lg mx-auto px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="font-display text-3xl font-bold text-white mb-2 animate-fade-in">
          Manage Booking
        </h1>
        <p className="text-white/40 text-sm mb-6">
          Confirmation code:{' '}
          <span className="text-gold-400 font-mono">{appointment.code}</span>
        </p>

        <div className="glass gold-border rounded-2xl p-6 mb-6 animate-slide-up">
          {cancelled && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">This appointment has been cancelled.</p>
            </div>
          )}

          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="font-display text-xl font-bold text-white mb-1">
                {appointment.service}
              </h2>
              <Badge className={`text-xs px-2.5 py-0.5 border ${status.className}`}>
                {status.label}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-gold-400 font-bold text-xl">
                {formatCurrency(appointment.price)}
              </div>
              <div className="text-white/30 text-xs mt-0.5">{appointment.duration} min</div>
            </div>
          </div>

          <Separator className="bg-white/8 mb-5" />

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gold-400" />
              </div>
              <div>
                <div className="text-white/40 text-xs">Barber</div>
                <div className="text-white font-medium">{appointment.barber}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-gold-400" />
              </div>
              <div>
                <div className="text-white/40 text-xs">Date</div>
                <div className="text-white font-medium">
                  {formatDate(appointment.date, 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-gold-400" />
              </div>
              <div>
                <div className="text-white/40 text-xs">Time</div>
                <div className="text-white font-medium">{formatTime(appointment.time)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                <Scissors className="w-4 h-4 text-gold-400" />
              </div>
              <div>
                <div className="text-white/40 text-xs">Customer</div>
                <div className="text-white font-medium">{appointment.customerName}</div>
                <div className="text-white/40 text-xs">{appointment.customerEmail}</div>
              </div>
            </div>
          </div>
        </div>

        {canModify ? (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400/60"
              onClick={() => setCancelOpen(true)}
            >
              Cancel Appointment
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href={`/booking?reschedule=${appointment.code}`}>Reschedule</Link>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-white/40 text-sm justify-center py-4">
            <CheckCircle2 className="w-4 h-4" />
            No actions available for this appointment
          </div>
        )}

        <p className="text-white/30 text-xs text-center mt-6">
          Need help?{' '}
          <a href="tel:+12017489849" className="text-gold-400/70 hover:text-gold-400">
            Call 201-748-9849
          </a>
        </p>
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="bg-charcoal-900 border-white/10 max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-white">
              Cancel Appointment?
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Are you sure you want to cancel your{' '}
              <span className="text-white font-medium">{appointment.service}</span>{' '}
              on{' '}
              <span className="text-white font-medium">
                {formatDate(appointment.date, 'MMMM d')} at {formatTime(appointment.time)}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-yellow-500/8 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-400/80">
            Cancellations made less than 24 hours before your appointment may forfeit your deposit.
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setCancelOpen(false)} disabled={isCancelling}>
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-500"
            >
              {isCancelling ? <><Loader2 className="w-4 h-4 animate-spin" />Cancelling...</> : 'Yes, Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
