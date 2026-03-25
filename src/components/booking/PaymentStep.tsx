'use client'

// Stripe payment step — shown after the user reviews their booking.
// Loads the Stripe Elements UI, collects card details, and confirms payment.

import { useEffect, useState } from 'react'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js'
import { Loader2, ShieldCheck, Lock, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Load Stripe once, outside the component (avoids re-creating on every render)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ─── Inner form (has access to Stripe context) ─────────────────────────────

interface PaymentFormProps {
  depositAmount: number
  confirmationCode: string
  onBack: () => void
}

function PaymentForm({ depositAmount, confirmationCode, onBack }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsLoading(true)
    setErrorMessage(null)

    // Confirm the PaymentIntent — Stripe handles the card UI validation
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // After payment succeeds, Stripe redirects here
        // The confirmationCode is already in the URL so the confirmation page
        // can display the right booking details
        return_url: `${window.location.origin}/booking/confirmation?code=${confirmationCode}&service=${new URLSearchParams(window.location.search).get('service') ?? ''}&paid=true`,
      },
    })

    // confirmPayment only returns here on error — success causes a redirect
    if (error) {
      setErrorMessage(
        error.type === 'card_error' || error.type === 'validation_error'
          ? (error.message ?? 'Payment failed.')
          : 'An unexpected error occurred. Please try again.',
      )
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Stripe card input */}
      <div className="bg-charcoal-900 rounded-xl border border-white/10 p-5">
        <PaymentElement
          options={{
            layout: 'tabs',
            // Style the Stripe iframe to match the dark theme
            defaultValues: {},
          }}
        />
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <span className="text-red-400 text-sm">{errorMessage}</span>
        </div>
      )}

      {/* Security note */}
      <div className="flex items-center gap-2 text-white/30 text-xs">
        <Lock className="w-3 h-3 flex-shrink-0" />
        <span>Secured by Stripe · 256-bit SSL encryption · We never store card details</span>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <Button
          type="submit"
          disabled={!stripe || !elements || isLoading}
          size="lg"
          className="w-full h-14 text-base font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing payment...
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              Pay ${depositAmount} Deposit &amp; Confirm Booking
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={isLoading}
          className="w-full gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Review
        </Button>
      </div>
    </form>
  )
}

// ─── Outer wrapper — handles fetching the clientSecret ─────────────────────

interface PaymentStepProps {
  booking: {
    serviceId: string
    barberId: string
    date: string
    time: string
    customerName: string
    customerEmail: string
    customerPhone: string
    notes: string
    serviceName: string
    servicePrice: number
    serviceDuration: number
    barberName: string
  }
  onBack: () => void
}

export function PaymentStep({ booking, onBack }: PaymentStepProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [confirmationCode, setConfirmationCode] = useState<string>('')
  const [depositAmount, setDepositAmount] = useState<number>(10)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Create the PaymentIntent as soon as this step mounts
  useEffect(() => {
    async function createIntent() {
      try {
        const res = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(booking),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? 'Failed to initialise payment. Please try again.')
          return
        }

        setClientSecret(data.clientSecret)
        setConfirmationCode(data.confirmationCode)
        setDepositAmount(data.depositAmount)
      } catch (err) {
        console.error('[PaymentStep] fetch error:', err)
        setError('Connection error. Please check your connection and try again.')
      } finally {
        setLoading(false)
      }
    }

    createIntent()
  }, []) // run once on mount

  // Stripe Elements appearance — dark theme matching the app
  const stripeOptions: StripeElementsOptions = {
    clientSecret: clientSecret ?? '',
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#C9A84C',
        colorBackground: '#111111',
        colorText: '#ffffff',
        colorDanger: '#f87171',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '8px',
      },
      rules: {
        '.Input': {
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.10)',
          color: '#ffffff',
        },
        '.Input:focus': {
          border: '1px solid rgba(201,168,76,0.5)',
          boxShadow: '0 0 0 2px rgba(201,168,76,0.15)',
        },
        '.Label': {
          color: 'rgba(255,255,255,0.5)',
          fontSize: '12px',
        },
        '.Tab': {
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.5)',
        },
        '.Tab--selected': {
          backgroundColor: 'rgba(201,168,76,0.10)',
          borderColor: 'rgba(201,168,76,0.4)',
          color: '#C9A84C',
        },
      },
    },
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
          Secure Deposit
        </h2>
        <p className="text-white/50 text-sm">
          A ${depositAmount} deposit locks in your booking. The rest is paid in store.
        </p>
      </div>

      {/* Booking mini-summary */}
      <div className="bg-charcoal-800 rounded-xl border border-white/8 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-white font-medium text-sm">{booking.serviceName}</p>
          <p className="text-white/40 text-xs mt-0.5">
            with {booking.barberName} · {booking.date} at {booking.time}
          </p>
        </div>
        <div className="text-right">
          <p className="text-white/40 text-xs">Deposit due now</p>
          <p className="text-gold-400 font-bold text-xl">${depositAmount}</p>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Setting up secure payment...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 space-y-3">
          <p className="text-red-400 text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={onBack}>
            Go Back
          </Button>
        </div>
      )}

      {/* Stripe Elements — only render when clientSecret is ready */}
      {!loading && !error && clientSecret && (
        <Elements stripe={stripePromise} options={stripeOptions}>
          <PaymentForm
            depositAmount={depositAmount}
            confirmationCode={confirmationCode}
            onBack={onBack}
          />
        </Elements>
      )}
    </div>
  )
}
