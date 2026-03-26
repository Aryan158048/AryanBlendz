'use client'

import { Calendar, Clock, Scissors, User, Mail, Phone, MessageSquare, ShieldCheck, Loader2 } from 'lucide-react'
import { cn, formatTime, getDurationLabel } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SERVICES } from './ServiceSelector'
import { format, parseISO } from 'date-fns'

interface BookingState {
  serviceId: string
  barberId?: string
  date: string
  time: string
  customerName: string
  customerEmail: string
  customerPhone: string
  notes: string
}

interface BookingSummaryProps {
  booking: BookingState
  onConfirm: () => void
  isSubmitting: boolean
}

interface SummaryRowProps {
  icon: React.ReactNode
  label: string
  value: string
  valueClassName?: string
}

function SummaryRow({ icon, label, value, valueClassName }: SummaryRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-gold-500">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white/40 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className={cn('text-white font-medium mt-0.5 text-sm sm:text-base', valueClassName)}>{value}</p>
      </div>
    </div>
  )
}

export function BookingSummary({ booking, onConfirm, isSubmitting }: BookingSummaryProps) {
  const service = SERVICES.find((s) => s.id === booking.serviceId)
  const barberName = 'Aryan'

  const formattedDate = booking.date
    ? format(parseISO(booking.date), 'EEEE, MMMM d, yyyy')
    : ''
  const formattedTime = booking.time ? formatTime(booking.time) : ''

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
          Review Your Booking
        </h2>
        <p className="text-white/50 text-sm">
          Please confirm your appointment details below
        </p>
      </div>

      <div className="bg-charcoal-800 rounded-xl border border-white/8 overflow-hidden">
        {/* Service header */}
        <div className="bg-gradient-to-r from-gold-900/30 to-gold-800/10 border-b border-white/8 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-1">Service</p>
              <h3 className="text-white font-bold text-xl sm:text-2xl font-display">{service?.name}</h3>
              <p className="text-white/40 text-sm mt-0.5">{service?.description}</p>
            </div>
            <div className="text-right">
              <p className="text-white/30 text-xs uppercase tracking-wide">Total</p>
              <p className="text-3xl sm:text-4xl font-bold text-gold-400">${service?.price}</p>
            </div>
          </div>
        </div>

        {/* Summary details */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SummaryRow
              icon={<Scissors className="w-4 h-4" />}
              label="Service"
              value={service?.name ?? ''}
            />
            <SummaryRow
              icon={<Clock className="w-4 h-4" />}
              label="Duration"
              value={getDurationLabel(service?.duration ?? 0)}
            />
          </div>

          <Separator className="bg-white/6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SummaryRow
              icon={<User className="w-4 h-4" />}
              label="Barber"
              value={barberName}
            />
            <SummaryRow
              icon={<Calendar className="w-4 h-4" />}
              label="Date"
              value={formattedDate}
            />
          </div>

          <SummaryRow
            icon={<Clock className="w-4 h-4" />}
            label="Time"
            value={formattedTime}
          />

          <Separator className="bg-white/6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SummaryRow
              icon={<User className="w-4 h-4" />}
              label="Name"
              value={booking.customerName}
            />
            <SummaryRow
              icon={<Phone className="w-4 h-4" />}
              label="Phone"
              value={booking.customerPhone}
            />
          </div>

          <SummaryRow
            icon={<Mail className="w-4 h-4" />}
            label="Email"
            value={booking.customerEmail}
          />

          {booking.notes && (
            <>
              <Separator className="bg-white/6" />
              <SummaryRow
                icon={<MessageSquare className="w-4 h-4" />}
                label="Notes"
                value={booking.notes}
              />
            </>
          )}
        </div>

        {/* Price footer */}
        <div className="border-t border-white/8 bg-charcoal-900/50 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-sm">Total Due</p>
              <p className="text-white/30 text-xs mt-0.5">Pay in store at time of appointment</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gold-400">${service?.price}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation policy */}
      <div className="flex items-start gap-3 bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-4">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-emerald-400 font-medium text-sm">Free Cancellation</p>
          <p className="text-white/40 text-xs mt-0.5 leading-relaxed">
            Cancel or reschedule up to 24 hours before your appointment at no charge.
          </p>
        </div>
      </div>

      {/* Confirm button */}
      <Button
        onClick={onConfirm}
        disabled={isSubmitting}
        size="lg"
        className="w-full h-14 text-base font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Confirming Booking...
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5" />
            Confirm Booking
          </>
        )}
      </Button>

      <p className="text-center text-white/25 text-xs">
        A confirmation will be sent to {booking.customerEmail}
      </p>
    </div>
  )
}
