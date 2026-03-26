'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, Scissors, User, CheckCircle2, Share2, ArrowLeft, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SERVICES } from '@/components/booking/ServiceSelector'
import { BARBERS } from '@/components/booking/BarberSelector'
import { formatTime, getDurationLabel } from '@/lib/utils'
import { format, parseISO } from 'date-fns'

function ConfirmationContent() {
  const params = useSearchParams()

  const code = params.get('code') ?? 'AB-UNKNOWN'
  const serviceId = params.get('service') ?? ''
  const barberId = params.get('barber') ?? ''
  const date = params.get('date') ?? ''
  const time = params.get('time') ?? ''
  const name = params.get('name') ?? ''
  const email = params.get('email') ?? ''
  const phone = params.get('phone') ?? ''
  const notes = params.get('notes') ?? ''

  const service = SERVICES.find((s) => s.id === serviceId)
  const barber = BARBERS.find((b) => b.id === barberId)
  const barberName = barberId === 'any' ? 'Any Available' : barber?.name ?? 'Your Barber'

  const formattedDate = date ? format(parseISO(date), 'EEEE, MMMM d, yyyy') : ''
  const formattedTime = time ? formatTime(time) : ''

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: 'Aryan Blendz Appointment',
        text: `I just booked a ${service?.name} at Aryan Blendz on ${formattedDate} at ${formattedTime}!`,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {})
    }
  }

  function handleAddToCalendar() {
    if (!date || !time || !service) return
    const [year, month, day] = date.split('-').map(Number)
    const [hour, minute] = time.split(':').map(Number)
    const start = new Date(year, month - 1, day, hour, minute)
    const end = new Date(start.getTime() + service.duration * 60 * 1000)

    const pad = (n: number) => String(n).padStart(2, '0')
    const fmt = (d: Date) =>
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${service.name} at Aryan Blendz`,
      `DESCRIPTION:Confirmation code: ${code}\\nBarber: ${barberName}`,
      'LOCATION:Judson Suites\\, 103 Davidson Rd\\, Piscataway\\, NJ 08854',
      `UID:${code}@aryanblendz.com`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aryan-blendz-${code}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-charcoal-950 relative overflow-hidden">
      {/* Celebration background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full opacity-0"
            style={{
              left: `${5 + (i * 4.7) % 90}%`,
              top: `${10 + (i * 7.3) % 40}%`,
              backgroundColor: i % 3 === 0 ? '#C9A84C' : i % 3 === 1 ? '#e8c359' : '#f2db95',
              animation: `confettiFall ${1.5 + (i % 4) * 0.4}s ease-out ${i * 0.12}s forwards`,
            }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`strip-${i}`}
            className="absolute w-0.5 h-4 opacity-0"
            style={{
              left: `${10 + (i * 7.2) % 80}%`,
              top: `${5 + (i * 5.8) % 30}%`,
              backgroundColor: i % 2 === 0 ? '#C9A84C' : '#B8972E',
              transform: `rotate(${i * 30}deg)`,
              animation: `confettiFall ${1.8 + (i % 3) * 0.3}s ease-out ${i * 0.18}s forwards`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes confettiFall {
          0% { opacity: 0; transform: translateY(-20px) rotate(0deg) scale(0); }
          20% { opacity: 1; }
          100% { opacity: 0; transform: translateY(120px) rotate(270deg) scale(1); }
        }
        @keyframes checkPop {
          0% { transform: scale(0) rotate(-15deg); opacity: 0; }
          60% { transform: scale(1.15) rotate(5deg); opacity: 1; }
          80% { transform: scale(0.95) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 24px rgba(201,168,76,0.3); }
          50% { box-shadow: 0 0 48px rgba(201,168,76,0.5), 0 0 80px rgba(201,168,76,0.2); }
        }
        .check-animate { animation: checkPop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.3s both; }
        .glow-pulse { animation: glowPulse 3s ease-in-out infinite; }
      `}</style>

      <div className="relative max-w-lg mx-auto px-4 py-12 space-y-8">
        {/* Success icon */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="check-animate glow-pulse w-24 h-24 rounded-full bg-gold-500/15 border-2 border-gold-500 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-gold-400" />
          </div>

          <div className="space-y-2 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white">
              You&apos;re all set!
            </h1>
            <p className="text-white/50 text-base leading-relaxed">
              Your appointment has been confirmed. We&apos;ll see you soon!
            </p>
          </div>

          {/* Confirmation code */}
          <div className="flex items-center gap-3 bg-gold-500/10 border border-gold-500/30 rounded-xl px-6 py-4">
            <div className="text-center">
              <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-1">
                Confirmation Code
              </p>
              <p className="text-gold-400 text-2xl font-bold font-mono tracking-wider">{code}</p>
            </div>
          </div>
        </div>

        {/* Booking details card */}
        <div className="bg-charcoal-800 rounded-xl border border-white/8 overflow-hidden animate-slide-up">
          <div className="bg-gradient-to-r from-gold-900/20 to-transparent border-b border-white/6 px-5 py-4">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wide">Appointment Details</h2>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                <Scissors className="w-4 h-4 text-gold-500" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Service</p>
                <p className="text-white font-medium">{service?.name ?? serviceId}</p>
                {service && (
                  <p className="text-white/30 text-xs mt-0.5">{getDurationLabel(service.duration)} · ${service.price}</p>
                )}
              </div>
            </div>

            <Separator className="bg-white/6" />

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gold-500" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Barber</p>
                <p className="text-white font-medium">{barberName}</p>
              </div>
            </div>

            <Separator className="bg-white/6" />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-gold-500" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">Date</p>
                  <p className="text-white font-medium text-sm">{formattedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-gold-500" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">Time</p>
                  <p className="text-white font-medium text-sm">{formattedTime}</p>
                </div>
              </div>
            </div>

            <Separator className="bg-white/6" />

            <div className="space-y-1">
              <p className="text-white/40 text-xs">Customer</p>
              <p className="text-white font-medium">{name}</p>
              <p className="text-white/40 text-sm">{email} · {phone}</p>
              {notes && <p className="text-white/30 text-sm italic mt-1">&ldquo;{notes}&rdquo;</p>}
            </div>
          </div>

          <div className="border-t border-white/6 bg-charcoal-900/50 px-5 py-4">
            <Badge variant="success" className="text-xs">
              <CheckCircle2 className="w-3 h-3" />
              Confirmed · Confirmation sent to {email}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 animate-fade-in">
          <Button
            onClick={handleAddToCalendar}
            variant="outline"
            size="lg"
            className="w-full gap-2"
          >
            <Calendar className="w-5 h-5" />
            Add to Calendar
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleShare}
              variant="secondary"
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button variant="secondary" className="gap-2" asChild>
              <Link href={`/manage?code=${code}`}>
                <ExternalLink className="w-4 h-4" />
                Manage
              </Link>
            </Button>
          </div>

          <Button variant="ghost" className="w-full gap-2" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Return Home
            </Link>
          </Button>
        </div>

        {/* Footer note */}
        <p className="text-center text-white/20 text-xs pb-4">
          Need to cancel? Free cancellation up to 24 hours before your appointment.
        </p>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
