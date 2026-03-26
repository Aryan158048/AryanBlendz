'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { number: 1, label: 'Service' },
  { number: 2, label: 'Date & Time' },
  { number: 3, label: 'Your Details' },
  { number: 4, label: 'Confirm' },
]

interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full px-4 py-6">
      <div className="flex items-center justify-center">
        <div className="flex items-center w-full max-w-2xl">
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > step.number
            const isCurrent = currentStep === step.number
            const isFuture = currentStep < step.number

            return (
              <div key={step.number} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 border-2',
                      isCompleted && 'bg-gold-500 border-gold-500 text-charcoal-950',
                      isCurrent && 'bg-gold-500/15 border-gold-500 text-gold-400 shadow-[0_0_16px_rgba(201,168,76,0.3)]',
                      isFuture && 'bg-charcoal-800 border-charcoal-700 text-white/30',
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium whitespace-nowrap hidden sm:block transition-colors duration-200',
                      isCompleted && 'text-gold-500',
                      isCurrent && 'text-gold-400',
                      isFuture && 'text-white/30',
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {index < STEPS.length - 1 && (
                  <div className="flex-1 h-px mx-2 mb-5 sm:mb-6 transition-all duration-300 relative overflow-hidden">
                    <div className="w-full h-full bg-charcoal-700" />
                    <div
                      className={cn(
                        'absolute inset-0 bg-gold-500 transition-all duration-500',
                        isCompleted ? 'w-full' : 'w-0',
                      )}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
