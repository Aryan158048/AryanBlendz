'use client'

import { useState, useEffect, useRef } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isToday, isSameDay, addMonths, subMonths, getDay,
  startOfWeek, endOfWeek,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getBarberSchedule, getAvailableSlots, getPopularHours } from '@/app/actions/booking'

function formatTimeLabel(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const display = h % 12 === 0 ? 12 : h % 12
  return `${display}:${String(m).padStart(2, '0')} ${period}`
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface DateTimeSelectorProps {
  selectedDate: string
  selectedTime: string
  onDateSelect: (date: string) => void
  onTimeSelect: (time: string) => void
}

export function DateTimeSelector({
  selectedDate, selectedTime, onDateSelect, onTimeSelect,
}: DateTimeSelectorProps) {
  const [viewMonth, setViewMonth] = useState(() => new Date())
  const [closedDays, setClosedDays] = useState<number[]>([])
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [scheduleLoading, setScheduleLoading] = useState(true)
  const [slots, setSlots] = useState<string[]>([])
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [popularHours, setPopularHours] = useState<Record<number, 'popular' | 'quiet'>>({})
  const timeSlotsRef = useRef<HTMLDivElement>(null)

  // Load schedule (closed days + blocked dates) + slot popularity on mount
  useEffect(() => {
    getBarberSchedule().then(({ closedDays, blockedDates }) => {
      setClosedDays(closedDays)
      setBlockedDates(blockedDates)
      setScheduleLoading(false)
    }).catch(() => setScheduleLoading(false))

    getPopularHours().then(setPopularHours).catch(() => {})
  }, [])

  // Load time slots when a date is selected
  useEffect(() => {
    if (!selectedDate) { setSlots([]); setBookedSlots([]); return }
    setSlotsLoading(true)
    getAvailableSlots(selectedDate).then((res) => {
      if (!res || !res.open) {
        setSlots([])
        setBookedSlots([])
      } else {
        setSlots(res.slots)
        setBookedSlots(res.booked)
      }
      setSlotsLoading(false)
    }).catch(() => { setSlotsLoading(false); setSlots([]); setBookedSlots([]) })
  }, [selectedDate])

  const selectedDateObj = selectedDate ? new Date(selectedDate + 'T12:00:00') : null

  const monthStart = startOfMonth(viewMonth)
  const monthEnd   = endOfMonth(viewMonth)
  const calDays    = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) })

  function isDisabled(date: Date): boolean {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const d = new Date(date); d.setHours(0, 0, 0, 0)
    if (d < today) return true
    if (closedDays.includes(getDay(date))) return true
    if (blockedDates.includes(format(date, 'yyyy-MM-dd'))) return true
    return false
  }

  function handleDateClick(date: Date) {
    if (isDisabled(date)) return
    onDateSelect(format(date, 'yyyy-MM-dd'))
    onTimeSelect('')
    // On mobile, scroll to time slots after picking a date
    setTimeout(() => {
      timeSlotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
          Select Date &amp; Time
        </h2>
        <p className="text-white/50 text-sm">
          Choose your preferred appointment date and time slot
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Calendar */}
        <div className="bg-charcoal-800 rounded-xl border border-white/8 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setViewMonth(subMonths(viewMonth, 1))}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-colors active:bg-white/12"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="font-semibold text-white text-sm">
              {format(viewMonth, 'MMMM yyyy')}
            </h3>
            <button
              onClick={() => setViewMonth(addMonths(viewMonth, 1))}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-colors active:bg-white/12"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="text-center text-[11px] font-semibold text-white/30 py-1.5 uppercase tracking-wide">{day}</div>
            ))}
          </div>

          {scheduleLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-5 h-5 text-gold-400 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {calDays.map((date, i) => {
                const disabled       = isDisabled(date)
                const isCurrentMonth = isSameMonth(date, viewMonth)
                const isSelectedDay  = selectedDateObj && isSameDay(date, selectedDateObj)
                const isTodayDate    = isToday(date)

                return (
                  <button
                    key={i}
                    onClick={() => handleDateClick(date)}
                    disabled={disabled || !isCurrentMonth}
                    className={cn(
                      'aspect-square rounded-lg text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95',
                      !isCurrentMonth && 'opacity-0 pointer-events-none',
                      isCurrentMonth && !disabled && !isSelectedDay && 'text-white hover:bg-gold-500/15 hover:text-gold-300 active:bg-gold-500/20',
                      isSelectedDay && 'bg-gold-500 text-charcoal-950 font-bold shadow-[0_0_12px_rgba(201,168,76,0.4)]',
                      isTodayDate && !isSelectedDay && 'ring-1 ring-gold-500/40 text-gold-400',
                      disabled && isCurrentMonth && 'text-white/15 cursor-not-allowed',
                    )}
                  >
                    {format(date, 'd')}
                  </button>
                )
              })}
            </div>
          )}

        </div>

        {/* Time slots */}
        <div ref={timeSlotsRef} className="bg-charcoal-800 rounded-xl border border-white/8 p-4 sm:p-5 scroll-mt-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-gold-500" />
            <h3 className="font-semibold text-white text-sm">
              {selectedDateObj
                ? `Times for ${format(selectedDateObj, 'EEE, MMM d')}`
                : 'Pick a date above'}
            </h3>
          </div>

          {!selectedDate ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-charcoal-700 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-white/30 text-sm">
                Select a date to see available times
              </p>
            </div>
          ) : slotsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 text-gold-400 animate-spin" />
            </div>
          ) : slots.filter(t => !bookedSlots.includes(t)).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
              <p className="text-white/40 text-sm">No open slots on this day.</p>
              <p className="text-white/25 text-xs">Try a different date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.filter((time) => !bookedSlots.includes(time)).map((time) => {
                const isSelected  = selectedTime === time
                const hour        = parseInt(time.split(':')[0], 10)
                const popularity  = popularHours[hour]
                return (
                  <button
                    key={time}
                    onClick={() => onTimeSelect(time)}
                    className={cn(
                      'rounded-xl py-2.5 px-2 text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95 flex flex-col items-center gap-0.5',
                      isSelected
                        ? 'bg-gold-500 text-charcoal-950 font-bold shadow-[0_0_12px_rgba(201,168,76,0.3)]'
                        : 'bg-charcoal-900 text-white active:bg-gold-500/15 border border-white/6',
                    )}
                  >
                    <span>{formatTimeLabel(time)}</span>
                    {!isSelected && popularity === 'popular' && (
                      <span className="text-[9px] font-semibold text-orange-400 leading-none">Popular</span>
                    )}
                    {!isSelected && popularity === 'quiet' && (
                      <span className="text-[9px] font-semibold text-emerald-400 leading-none">Best time</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
