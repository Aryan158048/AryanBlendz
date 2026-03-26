'use client'

import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDurationLabel } from '@/lib/utils'

export interface BookingService {
  id: string
  name: string
  duration: number
  price: number
  description: string
  category: string
}

const categoryIcons: Record<string, string> = {
  haircut: '✂️',
  beard:   '🪒',
  combo:   '⭐',
  kids:    '👦',
  premium: '👑',
  other:   '💈',
}

interface ServiceSelectorProps {
  services: BookingService[]
  selectedServiceId: string
  onSelect: (serviceId: string, service: BookingService) => void
}

export function ServiceSelector({ services, selectedServiceId, onSelect }: ServiceSelectorProps) {
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
          Choose Your Service
        </h2>
        <p className="text-white/50 text-sm">
          Select the service you&apos;d like to book
        </p>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12 text-white/40 text-sm">
          No services available at the moment.
        </div>
      ) : (
        <div className="space-y-2.5">
          {services.map((service) => {
            const isSelected = selectedServiceId === service.id
            const icon = categoryIcons[service.category] ?? categoryIcons.other

            return (
              <button
                key={service.id}
                onClick={() => onSelect(service.id, service)}
                className={cn(
                  'relative group w-full text-left rounded-xl border p-4 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-[0.99]',
                  isSelected
                    ? 'border-gold-500 bg-gold-500/10 shadow-[0_0_24px_rgba(201,168,76,0.15)]'
                    : 'border-white/8 bg-charcoal-800 active:bg-gold-500/5',
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-colors',
                    isSelected ? 'bg-gold-500/15' : 'bg-charcoal-700/60 group-active:bg-gold-500/10',
                  )}>
                    {icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={cn(
                        'font-semibold text-base transition-colors',
                        isSelected ? 'text-gold-300' : 'text-white',
                      )}>
                        {service.name}
                      </h3>
                      <span className={cn(
                        'text-lg font-bold flex-shrink-0 transition-colors',
                        isSelected ? 'text-gold-400' : 'text-gold-500',
                      )}>
                        ${service.price}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs leading-relaxed mt-0.5 line-clamp-1">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-1 text-white/30 mt-1.5">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{getDurationLabel(service.duration)}</span>
                    </div>
                  </div>

                  {/* Selected check */}
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200',
                    isSelected ? 'bg-gold-500 scale-100' : 'border-2 border-white/15 scale-90 opacity-0',
                  )}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-charcoal-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
