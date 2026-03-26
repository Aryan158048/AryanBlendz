'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2, CalendarOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { adminGetAvailability, adminSaveSchedule, adminAddBlockedDate, adminRemoveBlockedDate, adminGetBarberId } from '@/app/actions/admin'
import { DAYS_OF_WEEK } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type DaySchedule = {
  dayOfWeek:   number
  label:        string
  short:        string
  isAvailable:  boolean
  startTime:    string
  endTime:      string
}

type BlockedDate = {
  id:     string
  date:   string
  reason: string | null
}

function sliceTime(t: string) {
  return t ? t.slice(0, 5) : '09:00'
}

const DEFAULT_SCHEDULE: DaySchedule[] = DAYS_OF_WEEK.map((day) => ({
  dayOfWeek:   day.value,
  label:        day.label,
  short:        day.short,
  isAvailable:  day.value !== 0,
  startTime:    '09:00',
  endTime:      day.value === 5 ? '20:00' : day.value === 6 ? '18:00' : '19:00',
}))

// ── Component ─────────────────────────────────────────────────────────────────

export default function AvailabilityPage() {
  const [barberId, setBarberId]           = useState<string | null>(null)
  const [schedule, setSchedule]           = useState<DaySchedule[]>(DEFAULT_SCHEDULE)
  const [blocked, setBlocked]             = useState<BlockedDate[]>([])
  const [loading, setLoading]             = useState(true)
  const [isSaving, setIsSaving]           = useState(false)
  const [addBlockOpen, setAddBlockOpen]   = useState(false)
  const [blockDate, setBlockDate]         = useState('')
  const [blockReason, setBlockReason]     = useState('')
  const [isAddingBlock, setIsAddingBlock] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const bid = await adminGetBarberId()
      if (!bid) { setLoading(false); return }
      setBarberId(bid)

      const { availability, blocked: blockedRows } = await adminGetAvailability(bid)
      const dbMap = new Map((availability as any[]).map((r: any) => [r.day_of_week, r]))
      setSchedule(
        DAYS_OF_WEEK.map((day) => {
          const row = dbMap.get(day.value) as any
          return {
            dayOfWeek:   day.value,
            label:        day.label,
            short:        day.short,
            isAvailable:  row ? row.is_available : day.value !== 0,
            startTime:    row ? sliceTime(row.start_time) : '09:00',
            endTime:      row ? sliceTime(row.end_time)   : (day.value === 5 ? '20:00' : day.value === 6 ? '18:00' : '19:00'),
          }
        })
      )
      setBlocked(blockedRows as any[])
    } catch {
      toast.error('Failed to load availability')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const updateDay = (dayOfWeek: number, changes: Partial<DaySchedule>) => {
    setSchedule((prev) => prev.map((d) => d.dayOfWeek === dayOfWeek ? { ...d, ...changes } : d))
  }

  const saveSchedule = async () => {
    if (!barberId) return
    setIsSaving(true)
    try {
      await adminSaveSchedule(schedule, barberId)
      toast.success('Schedule saved')
    } catch {
      toast.error('Failed to save schedule')
    }
    setIsSaving(false)
  }

  const addBlockedDate = async () => {
    if (!blockDate || !barberId) { toast.error('Please select a date'); return }
    setIsAddingBlock(true)
    try {
      const data = await adminAddBlockedDate(barberId, blockDate, blockReason || 'Day off')
      setBlocked((prev) => [...prev, data as any].sort((a, b) => a.date.localeCompare(b.date)))
      setBlockDate('')
      setBlockReason('')
      setAddBlockOpen(false)
      toast.success('Date blocked')
    } catch {
      toast.error('Failed to block date')
    }
    setIsAddingBlock(false)
  }

  const removeBlock = async (id: string) => {
    try {
      await adminRemoveBlockedDate(id)
      setBlocked((prev) => prev.filter((b) => b.id !== id))
      toast.success('Block removed')
    } catch {
      toast.error('Failed to remove block')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">My Availability</h2>
        <p className="text-white/40 text-sm mt-1">Set your weekly hours and block off days you're unavailable</p>
      </div>

      {/* Weekly schedule */}
      <div className="glass gold-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-bold text-white">Weekly Schedule</h3>
          <Button size="sm" onClick={saveSchedule} disabled={isSaving}>
            {isSaving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving...</> : 'Save Schedule'}
          </Button>
        </div>

        <div className="space-y-2">
          {schedule.map((day) => (
            <div
              key={day.dayOfWeek}
              className={`flex items-center gap-4 p-3.5 rounded-xl transition-colors ${
                day.isAvailable ? 'bg-charcoal-900/50' : 'bg-charcoal-950/50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 w-32 flex-shrink-0">
                <Switch
                  checked={day.isAvailable}
                  onCheckedChange={(v) => updateDay(day.dayOfWeek, { isAvailable: v })}
                  className="data-[state=checked]:bg-gold-500"
                />
                <span className={`text-sm font-medium ${day.isAvailable ? 'text-white' : 'text-white/30'}`}>
                  {day.label}
                </span>
              </div>

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
                    Open
                  </Badge>
                </div>
              ) : (
                <div className="flex-1">
                  <Badge className="bg-red-500/10 text-red-400/60 border-red-500/20 text-xs">Closed</Badge>
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
            <p className="text-white/40 text-xs mt-0.5">Customers won't be able to book on these days</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setAddBlockOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Block
          </Button>
        </div>

        {blocked.length === 0 ? (
          <div className="text-center py-8">
            <CalendarOff className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No blocked dates — you're fully available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {blocked.map((b, i) => (
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
                      <div className="text-white/40 text-xs">{b.reason ?? 'Day off'}</div>
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
                {i < blocked.length - 1 && <Separator className="bg-white/5 my-0.5" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add block dialog */}
      <Dialog open={addBlockOpen} onOpenChange={setAddBlockOpen}>
        <DialogContent className="bg-charcoal-900 border-white/10 max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-white">Block a Date</DialogTitle>
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
                placeholder="e.g. Exam week, Personal day..."
                className="bg-charcoal-800 border-white/10 text-white placeholder:text-white/25 focus:border-gold-500/50"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setAddBlockOpen(false)}>Cancel</Button>
            <Button onClick={addBlockedDate} disabled={isAddingBlock}>
              {isAddingBlock ? <><Loader2 className="w-4 h-4 animate-spin" />Adding...</> : 'Block Date'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
