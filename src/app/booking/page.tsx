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
import { SERVICES } from '@/components/booking/ServiceSelector'
import { createClient } from '@/lib/supabase/client'

interface BookingData {
  serviceId: string
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

function BookingPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedService = searchParams.get('service') ?? ''

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCustomerFormValid, setIsCustomerFormValid] = useState(false)
  const [lockedUser, setLockedUser] = useState<{ name: string; email: string } | undefined>()
  const [booking, setBooking] = useState<BookingData>({
    serviceId: preselectedService,
    date: '',
    time: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user?.email) return
      // Get name from users table
      const { data: userRow } = await supabase
        .from('users').select('name').eq('id', user.id).single()
      const name = userRow?.name ?? user.email.split('@')[0]
      // Get phone from customers table if it exists
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
    if (step < 4 && canProceed(step, booking, isCustomerFormValid)) {
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
      const service = SERVICES.find((s) => s.id === booking.serviceId)

      const result = await createBooking({
        serviceId:       booking.serviceId,
        barberId:        'aryan',
        date:            booking.date,
        time:            booking.time,
        customerName:    booking.customerName,
        customerEmail:   booking.customerEmail,
        customerPhone:   booking.customerPhone,
        notes:           booking.notes,
        serviceName:     service?.name     ?? booking.serviceId,
        servicePrice:    service?.price    ?? 0,
        serviceDuration: service?.duration ?? 30,
        barberName:      'Aryan',
      })

      if (!result.success) {
        toast.error(result.error ?? 'Booking failed. Please try again.')
        return
      }

      const params = new URLSearchParams({
        code:    result.confirmationCode!,
        service: booking.serviceId,
        barber:  'aryan',
        date:    booking.date,
        time:    booking.time,
        name:    booking.customerName,
        email:   booking.customerEmail,
        phone:   booking.customerPhone,
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
    <div className="min-h-screen bg-charcoal-950 flex flex-col">
      <header className="border-b border-white/6 bg-charcoal-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-display font-bold text-gradient-gold">Aryan Blendz</span>
          </a>
          <div className="text-white/30 text-sm">Step {step} of 4</div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto w-full px-4">
        <StepIndicator currentStep={step} />
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 pb-8">
        <div className="min-h-[400px]">
          {step === 1 && (
            <ServiceSelector
              selectedServiceId={booking.serviceId}
              onSelect={(serviceId) => updateBooking({ serviceId })}
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
            <BookingSummary
              booking={{ ...booking, barberId: 'aryan' }}
              onConfirm={handleConfirm}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {step < 4 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/6">
            <Button variant="ghost" onClick={handleBack} disabled={step === 1} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              {!ready && step !== 3 && (
                <p className="text-white/30 text-xs hidden sm:block">
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
