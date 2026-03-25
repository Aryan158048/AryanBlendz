'use client'

import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isPast,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const TIME_SLOTS = [
  '09:00', '09:30',
  '10:00', '10:30',
  '11:00', '11:30',
  '12:00', '12:30',
  '13:00', '13:30',
  '14:00', '14:30',
  '15:00', '15:30',
  '16:00', '16:30',
  '17:00', '17:30',
  '18:00', '18:30',
]

// Demo: hardcode some booked slots for today and tomorrow
function getBookedSlots(date: Date): string[] {
  const day = date.getDate()
  if (day % 3 === 0) return ['10:00', '11:30', '14:00', '16:30']
  if (day % 3 === 1) return ['09:30', '12:00', '15:00', '17:30']
  return ['10:30', '13:00', '14:30', '16:00']
}

function formatTimeLabel(time: string): string {
  const [hourStr, minuteStr] = time.split(':')
  const hour = parseInt(hourStr, 10)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return `${displayHour}:${minuteStr} ${period}`
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface DateTimeSelectorProps {
  selectedDate: string
  selectedTime: string
  onDateSelect: (date: string) => void
  onTimeSelect: (time: string) => void
}

export function DateTimeSelector({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
}: DateTimeSelectorProps) {
  const [viewMonth, setViewMonth] = useState(() => new Date())

  const selectedDateObj = selectedDate ? new Date(selectedDate + 'T12:00:00') : null
  const bookedSlots = selectedDateObj ? getBookedSlots(selectedDateObj) : []

  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd })

  function isDisabled(date: Date): boolean {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d < today || getDay(date) === 0
  }

  function handleDateClick(date: Date) {
    if (isDisabled(date)) return
    const formatted = format(date, 'yyyy-MM-dd')
    onDateSelect(formatted)
    onTimeSelect('')
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

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Calendar */}
        <div className="flex-1 bg-charcoal-800 rounded-xl border border-white/8 p-5">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setViewMonth(subMonths(viewMonth, 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-semibold text-white text-sm">
              {format(viewMonth, 'MMMM yyyy')}
            </h3>
            <button
              onClick={() => setViewMonth(addMonths(viewMonth, 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-white/30 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {calDays.map((date, i) => {
              const disabled = isDisabled(date)
              const isCurrentMonth = isSameMonth(date, viewMonth)
              const isSelectedDay = selectedDateObj && isSameDay(date, selectedDateObj)
              const isTodayDate = isToday(date)
              const isSunday = getDay(date) === 0

              return (
                <button
                  key={i}
                  onClick={() => handleDateClick(date)}
                  disabled={disabled || !isCurrentMonth}
                  className={cn(
                    'aspect-square rounded-lg text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-500',
                    !isCurrentMonth && 'opacity-0 pointer-events-none',
                    isCurrentMonth && !disabled && !isSelectedDay && 'text-white hover:bg-gold-500/15 hover:text-gold-300',
                    isSelectedDay && 'bg-gold-500 text-charcoal-950 font-bold shadow-[0_0_12px_rgba(201,168,76,0.4)]',
                    isTodayDate && !isSelectedDay && 'ring-1 ring-gold-500/40 text-gold-400',
                    disabled && isCurrentMonth && !isSunday && 'text-white/20 cursor-not-allowed',
                    isSunday && isCurrentMonth && 'text-white/15 cursor-not-allowed',
                  )}
                >
                  {format(date, 'd')}
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-white/30">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gold-500/80" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full ring-1 ring-gold-500/40" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <span>Unavailable</span>
            </div>
          </div>
        </div>

        {/* Time slots */}
        <div className="flex-1 bg-charcoal-800 rounded-xl border border-white/8 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-gold-500" />
            <h3 className="font-semibold text-white text-sm">
              {selectedDateObj
                ? `Available times for ${format(selectedDateObj, 'EEE, MMM d')}`
                : 'Select a date first'}
            </h3>
          </div>

          {!selectedDate ? (
            <div className="flex flex-col items-center justify-center h-48 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-charcoal-700 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-white/30 text-sm">
                Pick a date on the calendar to see available time slots
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {TIME_SLOTS.map((time) => {
                const isBooked = bookedSlots.includes(time)
                const isSelected = selectedTime === time

                return (
                  <button
                    key={time}
                    onClick={() => !isBooked && onTimeSelect(time)}
                    disabled={isBooked}
                    className={cn(
                      'rounded-lg py-2.5 px-2 text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-500 relative',
                      isSelected && 'bg-gold-500 text-charcoal-950 font-bold shadow-[0_0_12px_rgba(201,168,76,0.3)]',
                      !isSelected && !isBooked && 'bg-charcoal-900 text-white hover:border-gold-500/50 hover:bg-gold-500/10 hover:text-gold-300 border border-white/6',
                      isBooked && 'bg-charcoal-900/50 text-white/15 cursor-not-allowed border border-white/4',
                    )}
                  >
                    {isBooked ? (
                      <span className="line-through">{formatTimeLabel(time)}</span>
                    ) : (
                      formatTimeLabel(time)
                    )}
                    {isBooked && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-charcoal-700 border border-charcoal-600 flex items-center justify-center">
                        <span className="text-white/30" style={{ fontSize: '7px' }}>✕</span>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {selectedDate && (
            <p className="mt-4 text-xs text-white/25 flex items-center gap-1">
              <span className="line-through text-white/20">10:00 AM</span>
              <span>= Booked · Sundays closed</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
