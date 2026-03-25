'use client'

import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDurationLabel } from '@/lib/utils'

interface BookingService {
  id: string
  name: string
  duration: number
  price: number
  description: string
  icon: string
}

const SERVICES: BookingService[] = [
  {
    id: '1',
    name: 'Haircut',
    duration: 45,
    price: 35,
    description: 'Classic or modern cut styled to perfection',
    icon: '✂️',
  },
  {
    id: '2',
    name: 'Beard Trim',
    duration: 30,
    price: 25,
    description: 'Shape and define your beard with precision',
    icon: '🪒',
  },
  {
    id: '3',
    name: 'Lineup',
    duration: 20,
    price: 20,
    description: 'Sharp edges and clean lines',
    icon: '📐',
  },
  {
    id: '4',
    name: 'Haircut + Beard',
    duration: 70,
    price: 55,
    description: 'Complete grooming package',
    icon: '⭐',
  },
  {
    id: '5',
    name: "Kid's Cut",
    duration: 30,
    price: 25,
    description: 'Ages 12 and under',
    icon: '👦',
  },
  {
    id: '6',
    name: 'Premium Package',
    duration: 90,
    price: 75,
    description: 'Full grooming experience with premium products',
    icon: '👑',
  },
]

interface ServiceSelectorProps {
  selectedServiceId: string
  onSelect: (serviceId: string) => void
}

export function ServiceSelector({ selectedServiceId, onSelect }: ServiceSelectorProps) {
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

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {SERVICES.map((service) => {
          const isSelected = selectedServiceId === service.id

          return (
            <button
              key={service.id}
              onClick={() => onSelect(service.id)}
              className={cn(
                'relative group text-left rounded-xl border p-4 sm:p-5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500',
                isSelected
                  ? 'border-gold-500 bg-gold-500/10 shadow-[0_0_24px_rgba(201,168,76,0.2)]'
                  : 'border-white/8 bg-charcoal-800 hover:border-gold-500/50 hover:bg-gold-500/5',
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-charcoal-950"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}

              <div className="space-y-3">
                <div className="text-2xl sm:text-3xl">{service.icon}</div>
                <div className="space-y-1">
                  <h3 className={cn(
                    'font-semibold text-sm sm:text-base transition-colors',
                    isSelected ? 'text-gold-300' : 'text-white group-hover:text-gold-300',
                  )}>
                    {service.name}
                  </h3>
                  <p className="text-white/40 text-xs leading-relaxed hidden sm:block">
                    {service.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 text-white/40">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{getDurationLabel(service.duration)}</span>
                  </div>
                  <span className={cn(
                    'text-base sm:text-lg font-bold transition-colors',
                    isSelected ? 'text-gold-400' : 'text-gold-500 group-hover:text-gold-400',
                  )}>
                    ${service.price}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { SERVICES }
export type { BookingService }
