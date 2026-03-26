'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Admin — Schedule Manager
//
// Two tabs:
//   1. My Schedule  — upload Rutgers screenshot → review/edit → save as admin busy times
//   2. Settings     — configure business hours + appointment duration
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Loader2, Save, Upload, CalendarDays, Settings2, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScheduleUploader } from '@/components/schedule/ScheduleUploader'
import { WeeklyScheduleEditor } from '@/components/schedule/WeeklyScheduleEditor'
import {
  adminGetWeeklySchedule,
  adminSaveWeeklySchedule,
  getScheduleSettings,
  adminSaveScheduleSettings,
} from '@/app/actions/schedule'
import type { WeeklySchedule, ScheduleSettings } from '@/lib/schedule/types'

// ── Schedule tab ──────────────────────────────────────────────────────────────

function ScheduleTab() {
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasExisting, setHasExisting] = useState(false)
  const [schedule, setSchedule] = useState<WeeklySchedule>({})
  const [semester, setSemester] = useState('Spring 2026')
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    adminGetWeeklySchedule()
      .then((data) => {
        if (data) {
          setSchedule(data.schedule)
          setSemester(data.semester)
          setHasExisting(true)
        }
      })
      .catch(() => toast.error('Failed to load schedule'))
      .finally(() => setLoading(false))
  }, [])

  const handleParsed = (parsed: WeeklySchedule) => {
    setSchedule(parsed)
    setIsDirty(true)
    toast.success('Schedule parsed — review and save below.')
  }

  const handleChange = (updated: WeeklySchedule) => {
    setSchedule(updated)
    setIsDirty(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await adminSaveWeeklySchedule(schedule, semester)
      if (!result.success) throw new Error(result.error)
      setHasExisting(true)
      setIsDirty(false)
      toast.success('Schedule saved! Students will now see mutual free times.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save schedule')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-5 h-5 text-gold-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Status banner */}
      {hasExisting && !isDirty ? (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20">
          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
          <p className="text-green-400/90 text-sm">
            Your schedule is active. Students can see mutual free times when they upload their schedule.
          </p>
        </div>
      ) : isDirty ? (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-gold-500/10 border border-gold-500/20">
          <AlertCircle className="w-4 h-4 text-gold-400 flex-shrink-0" />
          <p className="text-gold-400/90 text-sm">
            You have unsaved changes. Save below to make them live.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white/5 border border-white/10">
          <AlertCircle className="w-4 h-4 text-white/40 flex-shrink-0" />
          <p className="text-white/50 text-sm">
            No schedule saved yet. Upload your Rutgers schedule below to get started.
          </p>
        </div>
      )}

      {/* Semester label */}
      <div className="space-y-1.5">
        <Label className="text-white/60 text-sm">Semester / Label</Label>
        <Input
          value={semester}
          onChange={(e) => { setSemester(e.target.value); setIsDirty(true) }}
          placeholder="e.g. Spring 2026"
          className="bg-charcoal-900 border-white/10 text-white focus:border-gold-500/50 h-10 max-w-xs"
        />
        <p className="text-white/25 text-xs">Helps you remember which semester this schedule is for.</p>
      </div>

      <Separator className="bg-white/8" />

      {/* Upload new screenshot */}
      <div className="space-y-2">
        <h3 className="text-white/70 text-sm font-semibold flex items-center gap-2">
          <Upload className="w-4 h-4" />
          {hasExisting ? 'Upload New Schedule' : 'Upload Schedule'}
        </h3>
        <p className="text-white/35 text-xs">
          Upload a Rutgers weekly schedule screenshot. The AI will extract your class times automatically.
        </p>
        <ScheduleUploader
          onParsed={handleParsed}
          onError={(msg) => toast.error(msg)}
          loading={uploading}
          setLoading={setUploading}
        />
      </div>

      {/* Editable schedule preview */}
      {(Object.keys(schedule).length > 0 || hasExisting) && (
        <>
          <Separator className="bg-white/8" />
          <div className="space-y-3">
            <h3 className="text-white/70 text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Current Schedule
            </h3>
            <p className="text-white/30 text-xs">
              Edit any class block that was parsed incorrectly. Changes are saved when you click Save.
            </p>
            <WeeklyScheduleEditor schedule={schedule} onChange={handleChange} />
          </div>
        </>
      )}

      {/* Save button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={saving || uploading || !isDirty}
          className="h-10 bg-gold-500 hover:bg-gold-600 text-charcoal-950 font-semibold border-0 disabled:opacity-40"
        >
          {saving
            ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
            : <><Save className="w-4 h-4" />Save Schedule</>
          }
        </Button>
      </div>
    </div>
  )
}

// ── Settings tab ──────────────────────────────────────────────────────────────

function SettingsTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<ScheduleSettings>({
    businessHoursStart: '09:00',
    businessHoursEnd: '19:00',
    appointmentDuration: 30,
  })

  useEffect(() => {
    getScheduleSettings()
      .then(setSettings)
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await adminSaveScheduleSettings(settings)
      if (!result.success) throw new Error(result.error)
      toast.success('Settings saved!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-5 h-5 text-gold-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-md">
      <p className="text-white/40 text-sm">
        These settings control how mutual free slots are calculated for all students.
      </p>

      <Separator className="bg-white/8" />

      {/* Business hours */}
      <div className="space-y-3">
        <h3 className="text-white/70 text-sm font-semibold">Business Hours</h3>
        <p className="text-white/30 text-xs">
          Slots will only be generated within this window, even if both schedules are free outside it.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-white/55 text-xs">Opens at</Label>
            <Input
              type="time"
              value={settings.businessHoursStart}
              onChange={(e) => setSettings(s => ({ ...s, businessHoursStart: e.target.value }))}
              className="bg-charcoal-900 border-white/10 text-white focus:border-gold-500/50 h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/55 text-xs">Closes at</Label>
            <Input
              type="time"
              value={settings.businessHoursEnd}
              onChange={(e) => setSettings(s => ({ ...s, businessHoursEnd: e.target.value }))}
              className="bg-charcoal-900 border-white/10 text-white focus:border-gold-500/50 h-10"
            />
          </div>
        </div>
      </div>

      <Separator className="bg-white/8" />

      {/* Appointment duration */}
      <div className="space-y-2">
        <h3 className="text-white/70 text-sm font-semibold">Appointment Duration</h3>
        <p className="text-white/30 text-xs">
          Free windows are sliced into slots of this length. Only slots that fully fit within a free window are shown.
        </p>
        <Select
          value={String(settings.appointmentDuration)}
          onValueChange={(v) => setSettings(s => ({ ...s, appointmentDuration: Number(v) }))}
        >
          <SelectTrigger className="bg-charcoal-900 border-white/10 text-white h-10 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-charcoal-900 border-white/15">
            <SelectItem value="20" className="text-white hover:bg-white/8">20 minutes</SelectItem>
            <SelectItem value="30" className="text-white hover:bg-white/8">30 minutes</SelectItem>
            <SelectItem value="45" className="text-white hover:bg-white/8">45 minutes</SelectItem>
            <SelectItem value="60" className="text-white hover:bg-white/8">60 minutes</SelectItem>
            <SelectItem value="90" className="text-white hover:bg-white/8">90 minutes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="bg-white/8" />

      {/* Preview */}
      <div className="p-3.5 rounded-xl bg-white/3 border border-white/8 space-y-1">
        <p className="text-white/50 text-xs font-medium">Current configuration</p>
        <p className="text-white/35 text-xs">
          Business hours: <span className="text-white/65">{settings.businessHoursStart} – {settings.businessHoursEnd}</span>
        </p>
        <p className="text-white/35 text-xs">
          Slot duration: <span className="text-white/65">{settings.appointmentDuration} minutes</span>
        </p>
        <p className="text-white/35 text-xs">
          Max slots per day:{' '}
          <span className="text-white/65">
            {Math.floor(
              (Number(settings.businessHoursEnd.split(':')[0]) * 60 +
                Number(settings.businessHoursEnd.split(':')[1]) -
                Number(settings.businessHoursStart.split(':')[0]) * 60 -
                Number(settings.businessHoursStart.split(':')[1])) /
                settings.appointmentDuration,
            )}
            {' '}(if completely free)
          </span>
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-10"
        >
          {saving
            ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
            : <><Save className="w-4 h-4" />Save Settings</>
          }
        </Button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminSchedulePage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div>
        <h2 className="font-display text-xl font-bold text-white">Schedule Matcher</h2>
        <p className="text-white/35 text-xs mt-0.5">
          Upload your Rutgers class schedule so students can find times when you&apos;re both free.
        </p>
      </div>

      <Tabs defaultValue="schedule">
        <TabsList className="bg-charcoal-900 border border-white/8">
          <TabsTrigger
            value="schedule"
            className="data-[state=active]:bg-gold-500/15 data-[state=active]:text-gold-400 text-sm gap-1.5"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            My Schedule
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-gold-500/15 data-[state=active]:text-gold-400 text-sm gap-1.5"
          >
            <Settings2 className="w-3.5 h-3.5" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <div className="glass gold-border rounded-2xl p-5">
            <ScheduleTab />
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="glass gold-border rounded-2xl p-5">
            <SettingsTab />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
