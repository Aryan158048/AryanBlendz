'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StepIndicator } from '@/components/booking/StepIndicator'
import { ServiceSelector } from '@/components/booking/ServiceSelector'
import { DateTimeSelector } from '@/components/booking/DateTimeSelector'
import { CustomerForm } from '@/components/booking/CustomerForm'
import { BookingSummary } from '@/components/booking/BookingSummary'
import { toast } from 'sonner'
import { createBooking } from '@/app/actions/booking'
import { createClient } from '@/lib/supabase/client'
import type { BookingService } from '@/components/booking/ServiceSelector'

interface BookingData {
  serviceId: string
  serviceName: string
  servicePrice: number
  serviceDuration: number
  serviceDescription: string
  date: string
  time: string
  customerName: string
  customerEmail: string
  customerPhone: string
  notes: string
}

function canProceed(step: number, booking: BookingData, isCustomerFormValid: boolean): boolean {
  switch (step) {
    case 1: return !!booking.serviceId
    case 2: return !!booking.date && !!booking.time
    case 3: return isCustomerFormValid
    case 4: return true
    default: return false
  }
}

function BookingInner({ services }: { services: BookingService[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedService = searchParams.get('service') ?? ''

  const prefillDate = searchParams.get('date') ?? ''
  const prefillTime = searchParams.get('prefill_time') ?? ''
  const hasTimePrefill = !!(prefillDate && prefillTime)

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCustomerFormValid, setIsCustomerFormValid] = useState(false)
  const [lockedUser, setLockedUser] = useState<{ name: string; email: string } | undefined>()
  const [booking, setBooking] = useState<BookingData>({
    serviceId:          preselectedService,
    serviceName:        '',
    servicePrice:       0,
    serviceDuration:    0,
    serviceDescription: '',
    date:               prefillDate,
    time:               prefillTime,
    customerName:       '',
    customerEmail:      '',
    customerPhone:      '',
    notes:              '',
  })

  // Pre-select service if coming from services section
  useEffect(() => {
    if (!preselectedService || !services.length) return
    const svc = services.find((s) => s.id === preselectedService)
    if (svc) {
      setBooking((prev) => ({
        ...prev,
        serviceId:          svc.id,
        serviceName:        svc.name,
        servicePrice:       svc.price,
        serviceDuration:    svc.duration,
        serviceDescription: svc.description,
      }))
    }
  }, [preselectedService, services])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user?.email) return
      const { data: userRow } = await supabase
        .from('users').select('name').eq('id', user.id).single()
      const name = userRow?.name ?? user.email.split('@')[0]
      const { data: customer } = await supabase
        .from('customers').select('phone').eq('email', user.email).single()
      setLockedUser({ name, email: user.email })
      setBooking((prev) => ({
        ...prev,
        customerName:  name,
        customerEmail: user.email!,
        customerPhone: customer?.phone ?? '',
      }))
    })
  }, [])

  function updateBooking(partial: Partial<BookingData>) {
    setBooking((prev) => ({ ...prev, ...partial }))
  }

  function handleNext() {
    if (!canProceed(step, booking, isCustomerFormValid)) return
    if (step === 1 && hasTimePrefill) {
      setStep(3) // skip date/time — already prefilled from schedule page
    } else if (step < 4) {
      setStep((s) => s + 1)
    }
  }

  function handleBack() {
    if (step === 3 && hasTimePrefill) {
      setStep(1) // skip date/time going back too
    } else if (step > 1) {
      setStep((s) => s - 1)
    }
  }

  const handleCustomerValidChange = useCallback((valid: boolean) => {
    setIsCustomerFormValid(valid)
  }, [])

  async function handleConfirm() {
    setIsSubmitting(true)
    try {
      const result = await createBooking({
        serviceId:       booking.serviceId,
        barberId:        'aryan',
        date:            booking.date,
        time:            booking.time,
        customerName:    booking.customerName,
        customerEmail:   booking.customerEmail,
        customerPhone:   booking.customerPhone,
        notes:           booking.notes,
        serviceName:     booking.serviceName,
        servicePrice:    booking.servicePrice,
        serviceDuration: booking.serviceDuration,
        barberName:      'Aryan',
      })

      if (!result.success) {
        toast.error(result.error ?? 'Booking failed. Please try again.')
        return
      }

      const params = new URLSearchParams({
        code:        result.confirmationCode!,
        date:        booking.date,
        time:        booking.time,
        name:        booking.customerName,
        email:       booking.customerEmail,
        phone:       booking.customerPhone,
        svcName:     booking.serviceName,
        svcPrice:    String(booking.servicePrice),
        svcDuration: String(booking.serviceDuration),
      })
      if (booking.notes) params.set('notes', booking.notes)
      router.push(`/booking/confirmation?${params.toString()}`)
    } catch (err) {
      console.error('[handleConfirm]', err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const ready = canProceed(step, booking, isCustomerFormValid)

  return (
    <div className="min-h-dvh bg-charcoal-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/6 bg-charcoal-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <span className="text-lg font-display font-bold text-gradient-gold">Aryan Blendz</span>
          </a>
          <div className="text-white/25 text-xs hidden sm:block">Step {step} of 4</div>
        </div>
      </header>

      {/* Step indicator */}
      <div className="max-w-3xl mx-auto w-full px-4">
        <StepIndicator currentStep={step} />
      </div>

      {/* Main content */}
      <main className={`flex-1 max-w-3xl mx-auto w-full px-4 ${step < 4 ? 'pb-32 md:pb-10' : 'pb-10'}`}>
        {step === 1 && (
          <ServiceSelector
            services={services}
            selectedServiceId={booking.serviceId}
            onSelect={(serviceId, svc) => updateBooking({
              serviceId,
              serviceName:        svc.name,
              servicePrice:       svc.price,
              serviceDuration:    svc.duration,
              serviceDescription: svc.description,
            })}
          />
        )}
        {step === 2 && (
          <DateTimeSelector
            selectedDate={booking.date}
            selectedTime={booking.time}
            onDateSelect={(date) => updateBooking({ date })}
            onTimeSelect={(time) => updateBooking({ time })}
          />
        )}
        {step === 3 && (
          <CustomerForm
            values={{
              customerName:  booking.customerName,
              customerEmail: booking.customerEmail,
              customerPhone: booking.customerPhone,
              notes:         booking.notes,
            }}
            onChange={updateBooking}
            onValidChange={handleCustomerValidChange}
            lockedUser={lockedUser}
          />
        )}
        {step === 4 && (
          <>
            <button
              onClick={handleBack}
              className="md:hidden flex items-center gap-1.5 text-white/40 text-sm mb-5 hover:text-white/70 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Edit Details
            </button>
            <BookingSummary
              booking={booking}
              onConfirm={handleConfirm}
              isSubmitting={isSubmitting}
            />
          </>
        )}

        {/* Desktop navigation */}
        {step < 4 && (
          <div className="hidden md:flex items-center justify-between mt-8 pt-6 border-t border-white/6">
            <Button variant="ghost" onClick={handleBack} disabled={step === 1} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              {!ready && step !== 3 && (
                <p className="text-white/30 text-xs">
                  {step === 1 && 'Select a service to continue'}
                  {step === 2 && 'Select a date and time to continue'}
                </p>
              )}
              <Button onClick={handleNext} disabled={!ready} className="gap-2">
                {step === 3 ? 'Review Booking' : 'Continue'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile fixed bottom navigation */}
      {step < 4 && (
        <div className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-charcoal-950/95 backdrop-blur-md border-t border-white/10 pb-safe-4">
          <div className="flex gap-2 px-4 pt-3">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
              className="flex-1 h-12 gap-1 text-white/60 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!ready}
              className="flex-[2] h-12 gap-1 text-sm font-semibold"
            >
              {step === 3 ? 'Review Booking' : 'Continue'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BookingClient({ services }: { services: BookingService[] }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BookingInner services={services} />
    </Suspense>
  )
}
