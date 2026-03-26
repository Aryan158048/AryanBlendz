'use client'

// ─────────────────────────────────────────────────────────────────────────────
// AvailableSlotsView
//
// Displays the mutual free slots grouped by day.
// Clicking a slot opens a date-picker panel showing the next 3 occurrences
// of that weekday, then redirects to /booking with date+time pre-filled.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, ChevronRight, ArrowRight } from 'lucide-react'
import { format, addDays, nextMonday, nextTuesday, nextWednesday, nextThursday, nextFriday } from 'date-fns'
import { cn } from '@/lib/utils'
import type { AvailableSlot, AvailableSlotsMap, DayOfWeek, ScheduleSettings } from '@/lib/schedule/types'
import { SCHEDULE_DAYS, DAY_LABELS, DAY_SHORT } from '@/lib/schedule/types'

interface Props {
  slots: AvailableSlotsMap
  settings: ScheduleSettings
}

// Get the next N occurrences of a given weekday (starting from tomorrow)
function getNextDates(day: DayOfWeek, count = 3): Date[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = addDays(today, 1)

  const nextFns: Record<DayOfWeek, (d: Date) => Date> = {
    monday: nextMonday,
    tuesday: nextTuesday,
    wednesday: nextWednesday,
    thursday: nextThursday,
    friday: nextFriday,
    saturday: (d) => { let x = d; while (x.getDay() !== 6) x = addDays(x, 1); return x },
    sunday:   (d) => { let x = d; while (x.getDay() !== 0) x = addDays(x, 1); return x },
  }

  const dates: Date[] = []
  let cursor = tomorrow
  for (let i = 0; i < count; i++) {
    const next = nextFns[day](cursor)
    dates.push(next)
    cursor = addDays(next, 1)
  }
  return dates
}

interface SlotPickerProps {
  slot: AvailableSlot
  onClose: () => void
}

function DatePicker({ slot, onClose }: SlotPickerProps) {
  const router = useRouter()
  const dates = getNextDates(slot.day, 3)

  const book = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    // Pass date and time as query params to the booking page
    router.push(`/booking?date=${dateStr}&prefill_time=${slot.start}`)
  }

  return (
    <div className="mt-2 p-3 rounded-xl bg-charcoal-900 border border-white/15 space-y-2 animate-fade-in">
      <p className="text-white/50 text-xs font-medium">
        Pick a date for {slot.startFormatted} – {slot.endFormatted}
      </p>
      {dates.map((date) => (
        <button
          key={date.toISOString()}
          onClick={() => book(date)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 hover:bg-[#CC0033]/15 border border-white/8 hover:border-[#CC0033]/30 transition-all group"
        >
          <div className="text-left">
            <p className="text-white text-sm font-medium">
              {format(date, 'EEEE, MMMM d')}
            </p>
            <p className="text-white/40 text-xs">
              {slot.startFormatted} – {slot.endFormatted}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-white/25 group-hover:text-[#CC0033] transition-colors" />
        </button>
      ))}
      <button
        onClick={onClose}
        className="w-full text-center text-white/25 hover:text-white/50 text-xs py-1 transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}

export function AvailableSlotsView({ slots, settings }: Props) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null) // composite key day+start

  const totalSlots = SCHEDULE_DAYS.reduce((sum, day) => sum + (slots[day]?.length ?? 0), 0)

  if (totalSlots === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-white/6 flex items-center justify-center mx-auto">
          <Calendar className="w-6 h-6 text-white/25" />
        </div>
        <div>
          <p className="text-white/60 text-sm font-medium">No mutual free times found</p>
          <p className="text-white/30 text-xs mt-1">
            Our schedules are fully overlapping during business hours (
            {settings.businessHoursStart} – {settings.businessHoursEnd}).
            Try editing your schedule above or contact us directly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <p className="text-white/60 text-sm">
          <span className="text-white font-semibold">{totalSlots} slot{totalSlots !== 1 ? 's' : ''}</span>
          {' '}available across the week · {settings.appointmentDuration}-min appointments
        </p>
      </div>

      {/* Day columns */}
      {SCHEDULE_DAYS.map((day) => {
        const daySlots = slots[day] ?? []
        if (daySlots.length === 0) return null

        return (
          <div key={day} className="rounded-xl border border-white/8 overflow-hidden">
            {/* Day header */}
            <div className="px-3.5 py-2.5 bg-white/4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white/75 text-sm font-semibold">{DAY_LABELS[day]}</span>
                <span className="text-[10px] bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded-full">
                  {daySlots.length} open
                </span>
              </div>
              <Clock className="w-3.5 h-3.5 text-white/20" />
            </div>

            {/* Slot pills */}
            <div className="px-3.5 py-3 flex flex-wrap gap-2">
              {daySlots.map((slot) => {
                const key = `${day}-${slot.start}`
                const isOpen = selectedSlot === key

                return (
                  <div key={key} className="w-full sm:w-auto">
                    <button
                      onClick={() => setSelectedSlot(isOpen ? null : key)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all',
                        isOpen
                          ? 'bg-[#CC0033]/20 border-[#CC0033]/40 text-white'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white',
                      )}
                    >
                      <span>{slot.startFormatted}</span>
                      <ChevronRight className={cn(
                        'w-3.5 h-3.5 transition-transform',
                        isOpen ? 'rotate-90 text-[#CC0033]' : 'text-white/25',
                      )} />
                    </button>

                    {/* Inline date picker */}
                    {isOpen && (
                      <DatePicker
                        slot={slot}
                        onClose={() => setSelectedSlot(null)}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Footer tip */}
      <p className="text-white/25 text-xs text-center pt-1">
        Click a time slot to choose a specific date, then you&apos;ll be taken to the booking page.
      </p>
    </div>
  )
}
