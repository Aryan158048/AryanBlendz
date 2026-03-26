'use client'

import { ExternalLink, Star } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface BookingBarber {
  id: string
  name: string
  title: string
  yearsExperience: number
  specialties: string[]
  isAvailable: boolean
  instagram?: string
  rating: number
}

const BARBERS: BookingBarber[] = [
  {
    id: 'aryan',
    name: 'Aryan',
    title: 'Master Barber',
    yearsExperience: 8,
    specialties: ['Fades', 'Lineups'],
    isAvailable: true,
    instagram: 'aryanblendz',
    rating: 4.9,
  },
  {
    id: 'marcus',
    name: 'Marcus',
    title: 'Senior Barber',
    yearsExperience: 5,
    specialties: ['Beards', 'Classic Cuts'],
    isAvailable: true,
    rating: 4.8,
  },
  {
    id: 'jordan',
    name: 'Jordan',
    title: 'Barber',
    yearsExperience: 3,
    specialties: ['Modern Styles', 'Kids Cuts'],
    isAvailable: true,
    rating: 4.7,
  },
]

interface BarberSelectorProps {
  selectedBarberId: string
  onSelect: (barberId: string) => void
}

function BarberAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = getInitials(name)
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-base',
    lg: 'w-16 h-16 text-lg',
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-gold-700 to-gold-900 flex items-center justify-center font-bold text-gold-200 flex-shrink-0',
        sizeClasses[size],
      )}
    >
      {initials}
    </div>
  )
}

export function BarberSelector({ selectedBarberId, onSelect }: BarberSelectorProps) {
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
          Choose Your Barber
        </h2>
        <p className="text-white/50 text-sm">
          Or select &apos;Any Available&apos; for the next open slot
        </p>
      </div>

      <div className="space-y-3">
        {/* Any Available option */}
        <button
          onClick={() => onSelect('any')}
          className={cn(
            'w-full text-left rounded-xl border p-5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500',
            selectedBarberId === 'any'
              ? 'border-gold-500 bg-gold-500/10 shadow-[0_0_24px_rgba(201,168,76,0.2)]'
              : 'border-white/8 bg-charcoal-800 hover:border-gold-500/50 hover:bg-gold-500/5',
          )}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-charcoal-700 border-2 border-dashed border-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={cn(
                  'font-semibold text-base transition-colors',
                  selectedBarberId === 'any' ? 'text-gold-300' : 'text-white',
                )}>
                  Any Available
                </h3>
                <Badge variant="success" className="text-xs">Fastest</Badge>
              </div>
              <p className="text-white/40 text-sm mt-0.5">
                Get booked with the first available barber — great for flexible schedules
              </p>
            </div>
            {selectedBarberId === 'any' && (
              <div className="w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-charcoal-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        </button>

        {/* Individual barbers */}
        {BARBERS.map((barber) => {
          const isSelected = selectedBarberId === barber.id

          return (
            <button
              key={barber.id}
              onClick={() => onSelect(barber.id)}
              className={cn(
                'w-full text-left rounded-xl border p-5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500',
                isSelected
                  ? 'border-gold-500 bg-gold-500/10 shadow-[0_0_24px_rgba(201,168,76,0.2)]'
                  : 'border-white/8 bg-charcoal-800 hover:border-gold-500/50 hover:bg-gold-500/5',
              )}
            >
              <div className="flex items-center gap-4">
                <BarberAvatar name={barber.name} size="md" />

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={cn(
                          'font-semibold text-base transition-colors',
                          isSelected ? 'text-gold-300' : 'text-white',
                        )}>
                          {barber.name}
                        </h3>
                        {barber.isAvailable && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-emerald-400 text-xs font-medium">Available Today</span>
                          </div>
                        )}
                      </div>
                      <p className="text-white/40 text-sm">
                        {barber.title} · {barber.yearsExperience} yrs experience
                      </p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
                      <span className="text-white/60 text-sm font-medium">{barber.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {barber.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {barber.instagram && (
                      <a
                        href={`https://instagram.com/${barber.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-white/30 hover:text-gold-400 transition-colors text-xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>@{barber.instagram}</span>
                      </a>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-charcoal-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { BARBERS }
export type { BookingBarber }
