'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { DAY_LABELS, DAY_SHORT, SCHEDULE_DAYS } from '@/lib/schedule/types'
import { calculateAvailableSlots } from '@/lib/schedule/overlap'
import type { WeeklySchedule, AvailableSlotsMap, ScheduleSettings, DayOfWeek } from '@/lib/schedule/types'
import { AvailableSlotsView } from '@/components/schedule/AvailableSlotsView'

interface Props {
  adminSchedule: WeeklySchedule | null
  settings: ScheduleSettings
  onProceed?: (clientSchedule: WeeklySchedule, availableSlots: AvailableSlotsMap) => void
}

interface TimeBlock { start: string; end: string }

// Show 7 AM – 10 PM (15 hours) to keep the grid manageable on phones
const START_HOUR = 7
const END_HOUR = 22
const HOUR_HEIGHT = 56 // px per hour
const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT

const HOUR_LABELS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => {
  const h = i + START_HOUR
  return { label: `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? 'am' : 'pm'}`, top: i * HOUR_HEIGHT }
})

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

function pixelsToTime(px: number): string {
  // Snap to 15-min increments
  const raw = clamp(px, 0, TOTAL_HEIGHT) / HOUR_HEIGHT
  const totalMins = Math.round(raw * 60 / 15) * 15
  const absH = START_HOUR + Math.floor(totalMins / 60)
  const absM = totalMins % 60
  return `${String(Math.min(absH, END_HOUR)).padStart(2, '0')}:${String(absM).padStart(2, '0')}`
}

function timeToPixels(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return clamp((h - START_HOUR + m / 60) * HOUR_HEIGHT, 0, TOTAL_HEIGHT)
}

function getBusyBlocks(schedule: WeeklySchedule, day: DayOfWeek): TimeBlock[] {
  return (schedule[day] ?? []).map(b => ({ start: b.start, end: b.end }))
}

// ── Schedule grid (one day) ────────────────────────────────────────────────

interface GridProps {
  busyBlocks: TimeBlock[]
  onChange: (blocks: TimeBlock[]) => void
}

function ScheduleGrid({ busyBlocks, onChange }: GridProps) {
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef<{ startY: number; currentY: number } | null>(null)
  const [preview, setPreview] = useState<{ top: number; height: number } | null>(null)

  // ─── shared commit logic ────────────────────────────────────────────────
  function commit(endY: number) {
    if (!dragging.current) return
    const { startY } = dragging.current
    const top = Math.min(startY, endY)
    const bot = Math.max(startY, endY)
    dragging.current = null
    setPreview(null)
    if (bot - top < HOUR_HEIGHT / 4) return // ignore tiny taps

    const start = pixelsToTime(top)
    const end   = pixelsToTime(bot)
    if (start === end) return
    onChange([...busyBlocks, { start, end }].sort((a, b) => a.start.localeCompare(b.start)))
  }

  function getY(clientY: number) {
    const rect = ref.current!.getBoundingClientRect()
    return clamp(clientY - rect.top, 0, TOTAL_HEIGHT)
  }

  // ─── mouse ─────────────────────────────────────────────────────────────
  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    if (!ref.current) return
    const y = getY(e.clientY)
    dragging.current = { startY: y, currentY: y }
    setPreview({ top: y, height: 0 })
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current || !ref.current) return
    const y = getY(e.clientY)
    dragging.current.currentY = y
    const top = Math.min(dragging.current.startY, y)
    setPreview({ top, height: Math.abs(y - dragging.current.startY) })
  }
  function onMouseUp(e: React.MouseEvent) { commit(getY(e.clientY)) }

  // ─── touch (passive: false via native listener) ─────────────────────────
  function onTouchStart(e: React.TouchEvent) {
    if (!ref.current) return
    const y = getY(e.touches[0].clientY)
    dragging.current = { startY: y, currentY: y }
    setPreview({ top: y, height: 0 })
  }

  // We need { passive: false } on touchmove so we can preventDefault (stop page scroll)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    function onTouchMove(e: TouchEvent) {
      if (!dragging.current) return
      e.preventDefault()
      const rect = el!.getBoundingClientRect()
      const y = clamp(e.touches[0].clientY - rect.top, 0, TOTAL_HEIGHT)
      dragging.current.currentY = y
      const top = Math.min(dragging.current.startY, y)
      setPreview({ top, height: Math.abs(y - dragging.current.startY) })
    }
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => el.removeEventListener('touchmove', onTouchMove)
  }, [])

  function onTouchEnd(e: React.TouchEvent) {
    commit(getY(e.changedTouches[0].clientY))
  }

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => { if (dragging.current) commit(dragging.current.currentY) }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative bg-charcoal-950 rounded-b-lg select-none"
      style={{ height: TOTAL_HEIGHT, cursor: 'crosshair', touchAction: 'none' }}
    >
      {/* Hour lines */}
      {HOUR_LABELS.map(({ label, top }) => (
        <div
          key={label}
          className="absolute w-full border-t border-white/8 pointer-events-none"
          style={{ top }}
        >
          <span className="absolute text-[10px] text-white/25 left-1.5 -top-0.5 leading-none">{label}</span>
        </div>
      ))}

      {/* Drag preview */}
      {preview && preview.height > 4 && (
        <div
          className="absolute left-0 right-0 bg-red-400/20 border border-dashed border-red-400/60 rounded pointer-events-none"
          style={{ top: preview.top, height: preview.height }}
        />
      )}

      {/* Busy blocks */}
      {busyBlocks.map((b, i) => {
        const top    = timeToPixels(b.start)
        const height = Math.max(timeToPixels(b.end) - top, 20)
        return (
          <div
            key={i}
            className="absolute left-0 right-0 bg-red-500/30 border-l-2 border-red-500 rounded-r"
            style={{ top, height }}
          >
            <div className="flex items-center justify-between px-2 py-0.5">
              <span className="text-[10px] text-red-200 font-medium leading-tight">
                {b.start}–{b.end}
              </span>
              <button
                onMouseDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); onChange(busyBlocks.filter((_, j) => j !== i)) }}
                onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); onChange(busyBlocks.filter((_, j) => j !== i)) }}
                className="text-red-300/60 hover:text-red-300 ml-1 flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export function ClientScheduleChooser({ adminSchedule, settings }: Props) {
  const [clientSchedule, setClientSchedule] = useState<WeeklySchedule>({})
  const [availableSlots, setAvailableSlots] = useState<AvailableSlotsMap | null>(null)
  const [activeDay, setActiveDay] = useState<DayOfWeek>('monday')

  const updateDay = useCallback((day: DayOfWeek, blocks: TimeBlock[]) => {
    setClientSchedule(prev => ({
      ...prev,
      [day]: blocks.map(b => ({ id: `${day}-${b.start}`, start: b.start, end: b.end, title: 'Busy' })),
    }))
  }, [])

  useEffect(() => {
    if (!adminSchedule) return
    setAvailableSlots(calculateAvailableSlots(adminSchedule, clientSchedule, settings))
  }, [clientSchedule, adminSchedule, settings])

  if (!adminSchedule) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="glass gold-border rounded-2xl p-8 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
          <p className="text-white font-semibold">Schedule Not Set Up Yet</p>
          <p className="text-white/50 text-sm">Check back later or book directly.</p>
        </div>
      </div>
    )
  }

  const blockedDays = SCHEDULE_DAYS.filter(d => (clientSchedule[d]?.length ?? 0) > 0)

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-white">Mark Your Busy Times</h2>
        <p className="text-white/45 text-xs sm:text-sm mt-1">
          Drag (or press &amp; drag on mobile) the times you&apos;re <strong className="text-white/70">not free</strong>. Tap a red block to remove it.
        </p>
      </div>

      {/* ── Mobile: one day at a time ───────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {/* Day tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-3 px-3 snap-x" style={{ scrollbarWidth: 'none' }}>
          {SCHEDULE_DAYS.map(day => {
            const hasBlocks = (clientSchedule[day]?.length ?? 0) > 0
            const isActive  = activeDay === day
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={[
                  'flex-shrink-0 flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border snap-start',
                  isActive
                    ? 'bg-[#CC0033] border-[#CC0033] text-white'
                    : hasBlocks
                    ? 'bg-red-500/10 border-red-500/30 text-red-300'
                    : 'bg-white/5 border-white/10 text-white/50',
                ].join(' ')}
              >
                {DAY_SHORT[day]}
                {hasBlocks && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                )}
              </button>
            )
          })}
        </div>

        {/* Active day label + clear */}
        <div className="flex items-center justify-between px-0.5">
          <p className="text-white/70 text-xs sm:text-sm font-semibold">{DAY_LABELS[activeDay]}</p>
          {(clientSchedule[activeDay]?.length ?? 0) > 0 && (
            <button
              onClick={() => updateDay(activeDay, [])}
              className="text-xs text-red-400/60 hover:text-red-400 transition-colors"
            >
              Clear day
            </button>
          )}
        </div>

        <div className="rounded-xl border border-white/10 overflow-hidden">
          <ScheduleGrid
            busyBlocks={getBusyBlocks(clientSchedule, activeDay)}
            onChange={blocks => updateDay(activeDay, blocks)}
          />
        </div>
      </div>

      {/* ── Desktop: all days side by side ─────────────────────────────── */}
      <div className="hidden md:grid grid-cols-5 gap-3">
        {SCHEDULE_DAYS.map(day => (
          <div key={day} className="rounded-xl border border-white/10 overflow-hidden">
            <div className="px-2.5 py-2 bg-white/5 border-b border-white/8 flex items-center justify-between">
              <span className="text-xs font-semibold text-white/70">{DAY_SHORT[day]}</span>
              {(clientSchedule[day]?.length ?? 0) > 0 && (
                <button
                  onClick={() => updateDay(day, [])}
                  className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <ScheduleGrid
              busyBlocks={getBusyBlocks(clientSchedule, day)}
              onChange={blocks => updateDay(day, blocks)}
            />
          </div>
        ))}
      </div>

      {/* Blocked days summary */}
      {blockedDays.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
          <span className="text-white/30">Blocked:</span>
          {blockedDays.map(day => (
            <span key={day} className="bg-red-500/10 border border-red-500/20 text-red-300 px-2.5 py-1 rounded-full text-xs">
              {DAY_SHORT[day]}
            </span>
          ))}
          <button
            onClick={() => setClientSchedule({})}
            className="text-white/25 hover:text-white/50 transition-colors ml-auto text-xs"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Available slots */}
      {availableSlots && (
        <div className="glass gold-border rounded-2xl p-4 sm:p-6">
          <h3 className="font-semibold text-white text-base mb-4">Times We&apos;re Both Free</h3>
          <AvailableSlotsView slots={availableSlots} settings={settings} />
        </div>
      )}
    </div>
  )
}
