'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DAY_LABELS, SCHEDULE_DAYS } from '@/lib/schedule/types'
import { calculateAvailableSlots } from '@/lib/schedule/overlap'
import type { WeeklySchedule, AvailableSlotsMap, ScheduleSettings, DayOfWeek, ClassBlock } from '@/lib/schedule/types'

interface Props {
  adminSchedule: WeeklySchedule | null
  settings: ScheduleSettings
  onProceed: (clientSchedule: WeeklySchedule, availableSlots: AvailableSlotsMap) => void
  isLoading?: boolean
}

interface TimeBlock {
  start: string
  end: string
}

const HOUR_HEIGHT = 60 // pixels
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)

function timeToPixels(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours + minutes / 60) * HOUR_HEIGHT
}

function pixelsToTime(pixels: number): string {
  const totalMinutes = Math.round(pixels / HOUR_HEIGHT * 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function getBusyBlocks(schedule: WeeklySchedule, day: DayOfWeek): TimeBlock[] {
  return (schedule[day] || []).map(block => ({
    start: block.start,
    end: block.end,
  }))
}

interface ScheduleGridProps {
  day: DayOfWeek
  busyBlocks: TimeBlock[]
  onBlocksChange: (blocks: TimeBlock[]) => void
}

function ScheduleGrid({ day, busyBlocks, onBlocksChange }: ScheduleGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<number | null>(null)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top
    setIsDragging(true)
    setDragStart(y)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || dragStart === null || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top

    const startPixels = Math.min(dragStart, y)
    const endPixels = Math.max(dragStart, y)

    const startTime = pixelsToTime(startPixels)
    const endTime = pixelsToTime(endPixels)

    // Update UI visually (this is just preview, actual update happens on mouse up)
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || dragStart === null || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top

    const startPixels = Math.min(dragStart, y)
    const endPixels = Math.max(dragStart, y)

    const startTime = pixelsToTime(startPixels)
    const endTime = pixelsToTime(endPixels)

    if (startTime !== endTime) {
      // Check if clicking on existing block to remove
      const clickedExisting = busyBlocks.find(
        block => block.start === startTime && block.end === endTime
      )

      if (clickedExisting) {
        onBlocksChange(busyBlocks.filter(b => b !== clickedExisting))
      } else {
        // Add new block
        const newBlocks = [...busyBlocks, { start: startTime, end: endTime }].sort(
          (a, b) => a.start.localeCompare(b.start)
        )
        onBlocksChange(newBlocks)
      }
    }

    setIsDragging(false)
    setDragStart(null)
  }

  return (
    <div className="bg-charcoal-900 rounded-lg border border-white/10 overflow-hidden">
      {/* Day header */}
      <div className="px-3 py-2 bg-white/5 border-b border-white/8">
        <p className="font-semibold text-white text-sm">{DAY_LABELS[day]}</p>
      </div>

      {/* Time grid */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative select-none bg-charcoal-950 overflow-y-auto"
        style={{ height: `${24 * HOUR_HEIGHT}px`, cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Hour lines */}
        {TIME_SLOTS.map((time, i) => (
          <div
            key={time}
            className="absolute w-full border-t border-white/5 flex items-start"
            style={{ top: `${i * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
          >
            <span className="text-[10px] text-white/30 px-2 pt-1">{time}</span>
          </div>
        ))}

        {/* Busy blocks */}
        {busyBlocks.map((block, i) => {
          const startPixels = timeToPixels(block.start)
          const endPixels = timeToPixels(block.end)
          const height = Math.max(endPixels - startPixels, 20)

          return (
            <div
              key={i}
              className="absolute w-full left-0 bg-red-500/30 border-l-2 border-red-500 hover:bg-red-500/50 transition-colors cursor-pointer group"
              style={{ top: `${startPixels}px`, height: `${height}px` }}
              onClick={() => onBlocksChange(busyBlocks.filter((_, idx) => idx !== i))}
              title="Click to remove"
            >
              <div className="px-2 py-1 text-xs text-red-200 font-medium">
                {block.start}–{block.end}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ClientScheduleChooser({
  adminSchedule,
  settings,
  onProceed,
  isLoading = false,
}: Props) {
  const [clientSchedule, setClientSchedule] = useState<WeeklySchedule>({})
  const [availableSlots, setAvailableSlots] = useState<AvailableSlotsMap | null>(null)
  const [showResults, setShowResults] = useState(false)

  const handleBlocksChange = useCallback(
    (day: DayOfWeek, blocks: TimeBlock[]) => {
      setClientSchedule(prev => ({
        ...prev,
        [day]: blocks.map(b => ({
          id: `${day}-${b.start}`,
          start: b.start,
          end: b.end,
          title: 'User Busy',
        })),
      }))
    },
    []
  )

  // Calculate available slots when either schedule changes
  useEffect(() => {
    if (!adminSchedule) return

    const slots = calculateAvailableSlots(adminSchedule, clientSchedule, settings)
    setAvailableSlots(slots)
  }, [clientSchedule, adminSchedule, settings])

  const totalSlots = availableSlots
    ? SCHEDULE_DAYS.reduce((sum, day) => sum + (availableSlots[day]?.length ?? 0), 0)
    : 0

  const handleProceed = () => {
    if (availableSlots) {
      onProceed(clientSchedule, availableSlots)
    }
  }

  if (!adminSchedule) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="glass gold-border rounded-2xl p-8 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
          <p className="text-white font-semibold">Admin Schedule Not Available</p>
          <p className="text-white/50 text-sm">
            The barber hasn't set their schedule yet. Please check back later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="font-display text-3xl font-bold text-white">Mark Your Schedule</h2>
        <p className="text-white/50">
          Drag to select times when you're <strong>NOT available</strong>. We'll find slots that work for both of us.
        </p>
      </div>

      {/* Schedule grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {SCHEDULE_DAYS.map(day => (
          <ScheduleGrid
            key={day}
            day={day}
            busyBlocks={getBusyBlocks(clientSchedule, day)}
            onBlocksChange={(blocks) => handleBlocksChange(day, blocks)}
          />
        ))}
      </div>

      {/* Results section */}
      {availableSlots && (
        <>
          <div className="glass gold-border rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Available Times
                </h3>
                <p className="text-white/50 text-sm mt-1">
                  {totalSlots} time slot{totalSlots !== 1 ? 's' : ''} available this week
                </p>
              </div>
            </div>

            {totalSlots === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Clock className="w-10 h-10 text-white/20 mx-auto" />
                <p className="text-white/50 text-sm">
                  No available times with current selections. Try marking less time as busy.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SCHEDULE_DAYS.map(day => {
                  const slots = availableSlots[day] ?? []
                  if (slots.length === 0) return null

                  return (
                    <div key={day} className="space-y-2">
                      <p className="text-white/70 font-medium text-sm">{DAY_LABELS[day]}</p>
                      <div className="space-y-1">
                        {slots.map((slot, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-sm text-green-300"
                          >
                            {slot.startFormatted} – {slot.endFormatted}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                setClientSchedule({})
                setShowResults(false)
              }}
              variant="outline"
              className="border-white/15 text-white/50 hover:text-white hover:border-white/30 bg-transparent"
            >
              Clear All
            </Button>
            <Button
              onClick={handleProceed}
              disabled={isLoading || totalSlots === 0}
              className="flex-1 bg-[#CC0033] hover:bg-[#aa0028] text-white border-0"
            >
              {isLoading ? 'Processing...' : `Proceed to Booking (${totalSlots} slots)`}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
