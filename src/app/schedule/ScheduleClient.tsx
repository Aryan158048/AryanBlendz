'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Student Schedule Matcher — Full client flow
//
// Step 1: Upload  → drag-drop schedule screenshot → send to /api/parse-schedule
// Step 2: Review  → editable parsed class list, correct any mistakes
// Step 3: Results → show mutual free slots, click to book
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScheduleUploader } from '@/components/schedule/ScheduleUploader'
import { WeeklyScheduleEditor } from '@/components/schedule/WeeklyScheduleEditor'
import { AvailableSlotsView } from '@/components/schedule/AvailableSlotsView'
import { getAvailableSlotsForStudent } from '@/app/actions/schedule'
import type { WeeklySchedule, AvailableSlotsMap, ScheduleSettings } from '@/lib/schedule/types'

type Step = 'upload' | 'review' | 'results'

const STEP_LABELS: Record<Step, string> = {
  upload: 'Upload Schedule',
  review: 'Confirm Classes',
  results: 'Available Times',
}

const STEPS: Step[] = ['upload', 'review', 'results']

export function ScheduleClient() {
  const [step, setStep] = useState<Step>('upload')
  const [schedule, setSchedule] = useState<WeeklySchedule>({})
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [slots, setSlots] = useState<AvailableSlotsMap | null>(null)
  const [slotSettings, setSlotSettings] = useState<ScheduleSettings | null>(null)
  const [isPending, startTransition] = useTransition()

  // Called by ScheduleUploader after successful parse
  const handleParsed = (parsed: WeeklySchedule, imgUrl: string) => {
    setSchedule(parsed)
    setImageUrl(imgUrl)
    setStep('review')
  }

  // Called when student confirms their edited schedule
  const handleConfirm = () => {
    startTransition(async () => {
      const result = await getAvailableSlotsForStudent(schedule)

      if (!result.hasAdminSchedule) {
        toast.error("The barber hasn't uploaded their schedule yet. Please check back later or book directly.")
        return
      }

      setSlots(result.slots)
      setSlotSettings(result.settings)
      setStep('results')
    })
  }

  const reset = () => {
    setStep('upload')
    setSchedule({})
    setImageUrl(null)
    setSlots(null)
  }

  const currentStepIndex = STEPS.indexOf(step)

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="pt-10 pb-8 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#CC0033]/15 border border-[#CC0033]/25 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#CC0033]" />
          <span className="text-[#CC0033] text-xs font-semibold tracking-wide uppercase">
            Rutgers Students
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
          Find Your Perfect<br />Appointment Time
        </h1>
        <p className="text-white/45 text-sm max-w-md mx-auto leading-relaxed">
          Upload your Rutgers schedule and we&apos;ll automatically find times when
          we&apos;re both free — no back-and-forth needed.
        </p>
      </div>

      {/* ── Step indicator ─────────────────────────────────── */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => {
          const isComplete = currentStepIndex > i
          const isActive = step === s
          return (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={[
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  isComplete ? 'bg-green-500 text-white' :
                  isActive ? 'bg-[#CC0033] text-white' :
                  'bg-white/8 text-white/30',
                ].join(' ')}>
                  {isComplete ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={[
                  'text-[10px] font-medium hidden sm:block transition-colors whitespace-nowrap',
                  isActive ? 'text-white/80' : isComplete ? 'text-green-400/70' : 'text-white/25',
                ].join(' ')}>
                  {STEP_LABELS[s]}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={[
                  'flex-1 h-px mx-2 mb-4 sm:mb-0 transition-colors',
                  isComplete ? 'bg-green-500/40' : 'bg-white/10',
                ].join(' ')} />
              )}
            </div>
          )
        })}
      </div>

      {/* ── Step content ───────────────────────────────────── */}
      {step === 'upload' && (
        <div className="glass gold-border rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="font-display text-lg font-bold text-white">Upload Your Schedule</h2>
            <p className="text-white/40 text-sm mt-0.5">
              Take a screenshot of your Rutgers weekly schedule and drop it here
            </p>
          </div>
          <ScheduleUploader
            onParsed={handleParsed}
            onError={(msg) => toast.error(msg)}
            loading={uploading}
            setLoading={setUploading}
          />
        </div>
      )}

      {step === 'review' && (
        <div className="glass gold-border rounded-2xl p-5 space-y-5">
          <div>
            <h2 className="font-display text-lg font-bold text-white">Confirm Your Classes</h2>
            <p className="text-white/40 text-sm mt-0.5">
              Does this look right? Edit any mistakes before we calculate your free times.
            </p>
          </div>

          <WeeklyScheduleEditor schedule={schedule} onChange={setSchedule} />

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={reset}
              className="border-white/15 text-white/50 hover:text-white hover:border-white/30 bg-transparent h-10"
            >
              <ArrowLeft className="w-4 h-4" />
              Re-upload
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isPending}
              className="flex-1 h-10 bg-[#CC0033] hover:bg-[#aa0028] text-white border-0"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Finding free times…</>
              ) : (
                <>Looks right — show me available times <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 'results' && slots && slotSettings && (
        <div className="glass gold-border rounded-2xl p-5 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-white">Times We&apos;re Both Free</h2>
              <p className="text-white/40 text-sm mt-0.5">
                Based on your schedule and mine — click any slot to book it.
              </p>
            </div>
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition-colors py-1 px-2 rounded-lg hover:bg-white/6"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Start over
            </button>
          </div>

          <AvailableSlotsView slots={slots} settings={slotSettings} />
        </div>
      )}
    </div>
  )
}
