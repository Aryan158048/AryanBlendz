'use client'

// ─────────────────────────────────────────────────────────────────────────────
// WeeklyScheduleEditor
//
// Shows the parsed schedule in an editable list grouped by day.
// Each block shows start/end time + course title.
// Users can edit times/titles, add blocks, and delete blocks.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { Plus, Trash2, Edit3, Check, X, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatTime12h } from '@/lib/schedule/overlap'
import type { ClassBlock, DayOfWeek, WeeklySchedule } from '@/lib/schedule/types'
import { SCHEDULE_DAYS, DAY_LABELS } from '@/lib/schedule/types'

interface Props {
  schedule: WeeklySchedule
  onChange: (schedule: WeeklySchedule) => void
  /** If true, show a simplified read-only view (no edit/delete buttons) */
  readOnly?: boolean
}

// Generate a stable-enough id for new blocks
function newId() {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

// Validate "HH:MM" 24-hour format
function isValidTime(t: string) {
  return /^\d{1,2}:\d{2}$/.test(t)
}

interface BlockRowProps {
  block: ClassBlock
  onSave: (updated: ClassBlock) => void
  onDelete: () => void
  readOnly?: boolean
}

function BlockRow({ block, onSave, onDelete, readOnly }: BlockRowProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<ClassBlock>(block)

  const handleSave = () => {
    if (!isValidTime(draft.start) || !isValidTime(draft.end)) return
    onSave(draft)
    setEditing(false)
  }

  const handleCancel = () => {
    setDraft(block)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/6 border border-white/15">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Input
            value={draft.start}
            onChange={(e) => setDraft(d => ({ ...d, start: e.target.value }))}
            placeholder="HH:MM"
            className="h-8 w-20 bg-charcoal-900 border-white/15 text-white text-xs font-mono"
          />
          <span className="text-white/30 text-xs">→</span>
          <Input
            value={draft.end}
            onChange={(e) => setDraft(d => ({ ...d, end: e.target.value }))}
            placeholder="HH:MM"
            className="h-8 w-20 bg-charcoal-900 border-white/15 text-white text-xs font-mono"
          />
          <Input
            value={draft.title}
            onChange={(e) => setDraft(d => ({ ...d, title: e.target.value }))}
            placeholder="Course title"
            className="h-8 flex-1 bg-charcoal-900 border-white/15 text-white text-xs"
          />
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={handleSave}
            className="w-7 h-7 rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-400 flex items-center justify-center transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCancel}
            className="w-7 h-7 rounded-lg bg-white/6 hover:bg-white/12 text-white/50 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/4 border border-white/8 group">
      {/* Color bar */}
      <div className="w-1 h-7 rounded-full bg-[#CC0033]/50 flex-shrink-0" />

      {/* Time */}
      <div className="text-xs font-mono text-white/55 flex-shrink-0 w-28">
        {isValidTime(block.start) ? formatTime12h(block.start) : block.start}
        {' – '}
        {isValidTime(block.end) ? formatTime12h(block.end) : block.end}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0 text-xs text-white/80 font-medium truncate">
        {block.title || <span className="text-white/25 italic">Untitled</span>}
      </div>

      {!readOnly && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="w-6 h-6 rounded-lg hover:bg-white/10 text-white/35 hover:text-white/70 flex items-center justify-center transition-colors"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="w-6 h-6 rounded-lg hover:bg-red-500/15 text-white/35 hover:text-red-400 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}

export function WeeklyScheduleEditor({ schedule, onChange, readOnly = false }: Props) {
  // Only show days that have blocks, or Mon–Fri if all empty
  const activeDays = SCHEDULE_DAYS.filter(
    (day) => (schedule[day]?.length ?? 0) > 0,
  )
  const daysToShow = activeDays.length > 0 ? SCHEDULE_DAYS : SCHEDULE_DAYS

  const updateDay = (day: DayOfWeek, blocks: ClassBlock[]) => {
    onChange({ ...schedule, [day]: blocks })
  }

  const addBlock = (day: DayOfWeek) => {
    const existing = schedule[day] ?? []
    const newBlock: ClassBlock = {
      id: newId(),
      start: '09:00',
      end: '10:00',
      title: '',
    }
    updateDay(day, [...existing, newBlock])
  }

  const saveBlock = (day: DayOfWeek, id: string, updated: ClassBlock) => {
    const blocks = (schedule[day] ?? []).map((b) => (b.id === id ? updated : b))
    updateDay(day, blocks)
  }

  const deleteBlock = (day: DayOfWeek, id: string) => {
    const blocks = (schedule[day] ?? []).filter((b) => b.id !== id)
    updateDay(day, blocks)
  }

  const totalClasses = SCHEDULE_DAYS.reduce(
    (sum, day) => sum + (schedule[day]?.length ?? 0),
    0,
  )

  return (
    <div className="space-y-3">
      {/* Summary header */}
      <div className="flex items-center gap-2 text-white/50 text-xs">
        <BookOpen className="w-3.5 h-3.5" />
        <span>
          {totalClasses === 0
            ? 'No classes detected — add them manually below'
            : `${totalClasses} class${totalClasses !== 1 ? 'es' : ''} detected across the week`}
        </span>
      </div>

      {/* Day sections */}
      {daysToShow.map((day) => {
        const blocks = schedule[day] ?? []
        return (
          <div key={day} className="rounded-xl border border-white/8 overflow-hidden">
            {/* Day header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-white/4">
              <div className="flex items-center gap-2">
                <span className="text-white/70 text-sm font-semibold">{DAY_LABELS[day]}</span>
                {blocks.length > 0 && (
                  <span className="text-[10px] bg-[#CC0033]/20 text-[#CC0033]/80 px-1.5 py-0.5 rounded-full font-medium">
                    {blocks.length} class{blocks.length !== 1 ? 'es' : ''}
                  </span>
                )}
              </div>
              {!readOnly && (
                <button
                  onClick={() => addBlock(day)}
                  className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors py-1 px-2 rounded-lg hover:bg-white/6"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              )}
            </div>

            {/* Blocks list */}
            <div className={cn('px-3 py-2.5 space-y-1.5', blocks.length === 0 && 'py-2')}>
              {blocks.length === 0 ? (
                <p className="text-white/20 text-xs italic py-0.5">No classes</p>
              ) : (
                blocks.map((block) => (
                  <BlockRow
                    key={block.id}
                    block={block}
                    readOnly={readOnly}
                    onSave={(updated) => saveBlock(day, block.id, updated)}
                    onDelete={() => deleteBlock(day, block.id)}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}

      {!readOnly && (
        <p className="text-white/25 text-[11px] text-center pt-1">
          Hover any class to edit its time or title · Times are in 24-hour format (e.g. 13:30)
        </p>
      )}
    </div>
  )
}
