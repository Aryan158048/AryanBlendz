'use client'

import * as React from 'react'
import Link from 'next/link'
import { Calendar, Clock, User, DollarSign, Hash, Scissors } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CancelDialog } from '@/components/account/CancelDialog'
import { formatDate } from '@/lib/utils'

export type AppointmentStatus =
  | 'confirmed'
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export interface Appointment {
  id: string
  service: string
  barber: string
  date: string
  time: string
  status: AppointmentStatus
  price: number
  confirmationCode: string
}

interface AppointmentCardProps {
  appointment: Appointment
  variant: 'upcoming' | 'past'
  onCancel?: (id: string) => Promise<void> | void
  onBookAgain?: (appointment: Appointment) => void
}

const statusConfig: Record<
  AppointmentStatus,
  { label: string; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success'; dot: string }
> = {
  confirmed: { label: 'Confirmed', badgeVariant: 'success', dot: 'bg-emerald-400' },
  pending: { label: 'Pending', badgeVariant: 'default', dot: 'bg-gold-400' },
  completed: { label: 'Completed', badgeVariant: 'success', dot: 'bg-emerald-400' },
  cancelled: { label: 'Cancelled', badgeVariant: 'destructive', dot: 'bg-red-400' },
  no_show: { label: 'No Show', badgeVariant: 'secondary', dot: 'bg-white/30' },
}

export function AppointmentCard({
  appointment,
  variant,
  onCancel,
  onBookAgain,
}: AppointmentCardProps) {
  const [cancelOpen, setCancelOpen] = React.useState(false)
  const status = statusConfig[appointment.status] ?? statusConfig.pending
  const formattedDate = formatDate(appointment.date, 'EEE, MMM d, yyyy')

  const handleCancelConfirm = async (id: string) => {
    await onCancel?.(id)
  }

  return (
    <>
      <Card className="group relative overflow-hidden transition-all duration-200 hover:border-white/12 hover:shadow-[var(--shadow-dark-lg)]">
        {/* Gold left accent for confirmed/upcoming */}
        {variant === 'upcoming' && appointment.status === 'confirmed' && (
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold-500/60 via-gold-500/30 to-transparent rounded-l-xl" />
        )}

        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            {/* Left: service icon + info */}
            <div className="flex items-start gap-4 min-w-0">
              {/* Service icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mt-0.5">
                <Scissors className="w-5 h-5 text-gold-400" strokeWidth={1.5} />
              </div>

              <div className="min-w-0">
                {/* Service name + status */}
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white text-base leading-tight">
                    {appointment.service}
                  </h3>
                  <Badge variant={status.badgeVariant}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </Badge>
                </div>

                {/* Details row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-white/50">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-white/30" />
                    {appointment.barber}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-white/30" />
                    {formattedDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-white/30" />
                    {appointment.time}
                  </span>
                </div>

                {/* Confirmation code */}
                <div className="flex items-center gap-1.5 mt-2">
                  <Hash className="w-3 h-3 text-white/20" />
                  <span className="text-xs text-white/30 font-mono tracking-wide">
                    {appointment.confirmationCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: price */}
            <div className="flex-shrink-0 text-right">
              <div className="flex items-center gap-0.5 text-gold-400 font-semibold text-lg">
                <DollarSign className="w-4 h-4" strokeWidth={2} />
                {appointment.price}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/6">
            {variant === 'upcoming' ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() => setCancelOpen(true)}
                >
                  Cancel
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/booking?reschedule=${appointment.id}`}>
                    Reschedule
                  </Link>
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBookAgain?.(appointment)}
                asChild={!onBookAgain}
              >
                {onBookAgain ? (
                  'Book Again'
                ) : (
                  <Link href="/booking">Book Again</Link>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {variant === 'upcoming' && (
        <CancelDialog
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          appointmentId={appointment.id}
          serviceName={appointment.service}
          appointmentDate={formattedDate}
          onConfirm={handleCancelConfirm}
        />
      )}
    </>
  )
}
