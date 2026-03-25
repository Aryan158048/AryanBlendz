'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2, CalendarOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { BARBERS, DAYS_OF_WEEK } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

type DaySchedule = {
  dayOfWeek: number
  label: string
  short: string
  isAvailable: boolean
  startTime: string
  endTime: string
}

type BlockedDate = {
  id: string
  date: string
  reason: string
}

const defaultSchedule = (barberName: string): DaySchedule[] =>
  DAYS_OF_WEEK.map((day) => ({
    dayOfWeek: day.value,
    label: day.label,
    short: day.short,
    isAvailable: day.value !== 0 || barberName === 'Aryan',
    startTime: day.value === 0 ? '10:00' : '09:00',
    endTime: day.value === 5 ? '20:00' : day.value === 6 ? '18:00' : '19:00',
  }))

const defaultBlocked: Record<string, BlockedDate[]> = {
  brb_aryan:   [{ id: 'b1', date: '2026-04-07', reason: 'Personal day' }],
  brb_marcus:  [],
  brb_jerome:  [{ id: 'b2', date: '2026-04-14', reason: 'Training' }],
  brb_darius:  [],
}

export default function AvailabilityPage() {
  const [activeBarber, setActiveBarber] = useState(BARBERS[0].id)
  const [schedules, setSchedules] = useState<Record<string, DaySchedule[]>>(
    Object.fromEntries(BARBERS.map((b) => [b.id, defaultSchedule(b.name)])),
  )
  const [blocked, setBlocked] = useState<Record<string, BlockedDate[]>>(defaultBlocked)
  const [addBlockOpen, setAddBlockOpen] = useState(false)
  const [blockDate, setBlockDate] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isAddingBlock, setIsAddingBlock] = useState(false)

  const currentSchedule = schedules[activeBarber] ?? []
  const currentBlocked = blocked[activeBarber] ?? []
  const barber = BARBERS.find((b) => b.id === activeBarber)

  const updateDay = (dayOfWeek: number, changes: Partial<DaySchedule>) => {
    setSchedules((prev) => ({
      ...prev,
      [activeBarber]: prev[activeBarber].map((d) =>
        d.dayOfWeek === dayOfWeek ? { ...d, ...changes } : d,
      ),
    }))
  }

  const saveSchedule = async () => {
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setIsSaving(false)
    toast.success(`Schedule saved for ${barber?.name}`)
  }

  const addBlockedDate = async () => {
    if (!blockDate) {
      toast.error('Please select a date')
      return
    }
    setIsAddingBlock(true)
    await new Promise((r) => setTimeout(r, 600))
    setBlocked((prev) => ({
      ...prev,
      [activeBarber]: [
        ...(prev[activeBarber] ?? []),
        {
          id: `b${Date.now()}`,
          date: blockDate,
          reason: blockReason || 'Day off',
        },
      ],
    }))
    setBlockDate('')
    setBlockReason('')
    setIsAddingBlock(false)
    setAddBlockOpen(false)
    toast.success('Date blocked successfully')
  }

  const removeBlock = (id: string) => {
    setBlocked((prev) => ({
      ...prev,
      [activeBarber]: (prev[activeBarber] ?? []).filter((b) => b.id !== id),
    }))
    toast.success('Block removed')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Availability</h2>
          <p className="text-white/40 text-sm mt-1">Manage barber schedules and blocked dates</p>
        </div>
      </div>

      {/* Barber tabs */}
      <div className="glass gold-border rounded-2xl p-1 flex gap-1 flex-wrap">
        {BARBERS.map((b) => (
          <button
            key={b.id}
            onClick={() => setActiveBarber(b.id)}
            className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeBarber === b.id
                ? 'bg-gold-500/15 text-gold-400 border border-gold-500/20'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Weekly schedule */}
      <div className="glass gold-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-bold text-white">
            Weekly Schedule
            <span className="text-white/40 text-sm font-normal ml-2">— {barber?.name}</span>
          </h3>
          <Button size="sm" onClick={saveSchedule} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Schedule'
            )}
          </Button>
        </div>

        <div className="space-y-2">
          {currentSchedule.map((day) => (
            <div
              key={day.dayOfWeek}
              className={`flex items-center gap-4 p-3.5 rounded-xl transition-colors ${
                day.isAvailable ? 'bg-charcoal-900/50' : 'bg-charcoal-950/50 opacity-60'
              }`}
            >
              {/* Day name + toggle */}
              <div className="flex items-center gap-3 w-32 flex-shrink-0">
                <Switch
                  checked={day.isAvailable}
                  onCheckedChange={(v) => updateDay(day.dayOfWeek, { isAvailable: v })}
                  className="data-[state=checked]:bg-gold-500"
                />
                <span
                  className={`text-sm font-medium ${
                    day.isAvailable ? 'text-white' : 'text-white/30'
                  }`}
                >
                  {day.label}
                </span>
              </div>

              {/* Time range */}
              {day.isAvailable ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    value={day.startTime}
                    onChange={(e) => updateDay(day.dayOfWeek, { startTime: e.target.value })}
                    className="bg-charcoal-900 border-white/10 text-white h-8 text-sm w-28"
                  />
                  <span className="text-white/30 text-sm flex-shrink-0">to</span>
                  <Input
                    type="time"
                    value={day.endTime}
                    onChange={(e) => updateDay(day.dayOfWeek, { endTime: e.target.value })}
                    className="bg-charcoal-900 border-white/10 text-white h-8 text-sm w-28"
                  />
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs hidden sm:flex">
                    Available
                  </Badge>
                </div>
              ) : (
                <div className="flex-1">
                  <Badge className="bg-red-500/10 text-red-400/60 border-red-500/20 text-xs">
                    Day Off
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Blocked dates */}
      <div className="glass gold-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display text-lg font-bold text-white">Blocked Dates</h3>
            <p className="text-white/40 text-xs mt-0.5">
              Specific dates where {barber?.name} is unavailable
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setAddBlockOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Block
          </Button>
        </div>

        {currentBlocked.length === 0 ? (
          <div className="text-center py-8">
            <CalendarOff className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No blocked dates for {barber?.name}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentBlocked.map((b, i) => (
              <div key={b.id}>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-charcoal-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <CalendarOff className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">
                        {formatDate(b.date, 'EEEE, MMMM d, yyyy')}
                      </div>
                      <div className="text-white/40 text-xs">{b.reason}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400/50 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => removeBlock(b.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {i < currentBlocked.length - 1 && <Separator className="bg-white/5 my-0.5" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add blocked date dialog */}
      <Dialog open={addBlockOpen} onOpenChange={setAddBlockOpen}>
        <DialogContent className="bg-charcoal-900 border-white/10 max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-white">
              Block a Date
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-white/70">Date</Label>
              <Input
                type="date"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="bg-charcoal-800 border-white/10 text-white focus:border-gold-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Reason (optional)</Label>
              <Input
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g. Personal day, Training..."
                className="bg-charcoal-800 border-white/10 text-white placeholder:text-white/25 focus:border-gold-500/50"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setAddBlockOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addBlockedDate} disabled={isAddingBlock}>
              {isAddingBlock ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Block Date'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
