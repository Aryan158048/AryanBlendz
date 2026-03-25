'use client'

import { useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StepIndicator } from '@/components/booking/StepIndicator'
import { ServiceSelector } from '@/components/booking/ServiceSelector'
import { BarberSelector } from '@/components/booking/BarberSelector'
import { DateTimeSelector } from '@/components/booking/DateTimeSelector'
import { CustomerForm } from '@/components/booking/CustomerForm'
import { BookingSummary } from '@/components/booking/BookingSummary'
import { generateConfirmationCode, sleep } from '@/lib/utils'

interface BookingData {
  serviceId: string
  barberId: string
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
    case 2: return !!booking.barberId
    case 3: return !!booking.date && !!booking.time
    case 4: return isCustomerFormValid
    case 5: return true
    default: return false
  }
}

function BookingPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedService = searchParams.get('service') ?? ''

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCustomerFormValid, setIsCustomerFormValid] = useState(false)
  const [booking, setBooking] = useState<BookingData>({
    serviceId: preselectedService,
    barberId: '',
    date: '',
    time: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: '',
  })

  function updateBooking(partial: Partial<BookingData>) {
    setBooking((prev) => ({ ...prev, ...partial }))
  }

  function handleNext() {
    if (step < 5 && canProceed(step, booking, isCustomerFormValid)) {
      setStep((s) => s + 1)
    }
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1)
  }

  const handleCustomerValidChange = useCallback((valid: boolean) => {
    setIsCustomerFormValid(valid)
  }, [])

  async function handleConfirm() {
    setIsSubmitting(true)
    try {
      await sleep(1500)
      const code = generateConfirmationCode()
      const params = new URLSearchParams({
        code,
        service: booking.serviceId,
        barber: booking.barberId,
        date: booking.date,
        time: booking.time,
        name: booking.customerName,
        email: booking.customerEmail,
        phone: booking.customerPhone,
      })
      if (booking.notes) params.set('notes', booking.notes)
      router.push(`/booking/confirmation?${params.toString()}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const ready = canProceed(step, booking, isCustomerFormValid)

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/6 bg-charcoal-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-display font-bold text-gradient-gold">Aryan Blendz</span>
          </a>
          <div className="text-white/30 text-sm">
            Step {step} of 5
          </div>
        </div>
      </header>

      {/* Step indicator */}
      <div className="max-w-3xl mx-auto w-full px-4">
        <StepIndicator currentStep={step} />
      </div>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 pb-8">
        <div className="min-h-[400px]">
          {step === 1 && (
            <ServiceSelector
              selectedServiceId={booking.serviceId}
              onSelect={(serviceId) => updateBooking({ serviceId })}
            />
          )}
          {step === 2 && (
            <BarberSelector
              selectedBarberId={booking.barberId}
              onSelect={(barberId) => updateBooking({ barberId })}
            />
          )}
          {step === 3 && (
            <DateTimeSelector
              selectedDate={booking.date}
              selectedTime={booking.time}
              onDateSelect={(date) => updateBooking({ date })}
              onTimeSelect={(time) => updateBooking({ time })}
            />
          )}
          {step === 4 && (
            <CustomerForm
              values={{
                customerName: booking.customerName,
                customerEmail: booking.customerEmail,
                customerPhone: booking.customerPhone,
                notes: booking.notes,
              }}
              onChange={updateBooking}
              onValidChange={handleCustomerValidChange}
            />
          )}
          {step === 5 && (
            <BookingSummary
              booking={booking}
              onConfirm={handleConfirm}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {/* Navigation */}
        {step < 5 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/6">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              {!ready && step !== 4 && (
                <p className="text-white/30 text-xs hidden sm:block">
                  {step === 1 && 'Select a service to continue'}
                  {step === 2 && 'Select a barber to continue'}
                  {step === 3 && 'Select a date and time to continue'}
                </p>
              )}
              <Button
                onClick={handleNext}
                disabled={!ready}
                className="gap-2"
              >
                {step === 4 ? 'Review Booking' : 'Continue'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BookingPageInner />
    </Suspense>
  )
}
