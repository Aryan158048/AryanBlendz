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
    <div className="w-full px-4 py-4 sm:py-6">
      <div className="flex items-center justify-center">
        <div className="flex items-center w-full max-w-2xl">
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > step.number
            const isCurrent = currentStep === step.number
            const isFuture = currentStep < step.number

            return (
              <div key={step.number} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 border-2',
                      isCompleted && 'bg-gold-500 border-gold-500 text-charcoal-950',
                      isCurrent && 'bg-gold-500/15 border-gold-500 text-gold-400 shadow-[0_0_16px_rgba(201,168,76,0.3)]',
                      isFuture && 'bg-charcoal-800 border-charcoal-700 text-white/30',
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <span className="text-xs sm:text-sm">{step.number}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] sm:text-xs font-medium whitespace-nowrap transition-colors duration-200',
                      isCompleted && 'text-gold-500',
                      isCurrent && 'text-gold-400',
                      isFuture && 'text-white/25',
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {index < STEPS.length - 1 && (
                  <div className="flex-1 h-px mx-1.5 sm:mx-2 mb-4 sm:mb-5 transition-all duration-300 relative overflow-hidden">
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
