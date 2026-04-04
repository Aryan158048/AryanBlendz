// ── No-Show Risk Scorer ───────────────────────────────────────────────────────
// Rule-based prototype. Each factor adds to a 0-100 score.
// Risk levels: low < 25, medium 25-49, high >= 50

export type NoShowRisk = 'low' | 'medium' | 'high'

export interface NoShowInput {
  appointmentDate: string   // YYYY-MM-DD
  appointmentTime: string   // HH:MM or HH:MM:SS
  createdAt: string         // ISO timestamp (when booking was made)
  totalVisits: number       // customer's all-time visit count
  priorNoShows: number      // past no-show count for this customer
  priorCancellations: number
}

export interface NoShowResult {
  risk: NoShowRisk
  score: number
  reasons: string[]
}

export function scoreNoShow(input: NoShowInput): NoShowResult {
  let score = 0
  const reasons: string[] = []

  // Factor 1: how far in advance was the booking made?
  const apptMs  = new Date(`${input.appointmentDate}T${input.appointmentTime.slice(0, 5)}:00`).getTime()
  const bookedMs = new Date(input.createdAt).getTime()
  const hoursAhead = (apptMs - bookedMs) / 3_600_000

  if (hoursAhead < 2) {
    score += 35
    reasons.push('Last-minute booking')
  } else if (hoursAhead < 6) {
    score += 15
    reasons.push('Same-day booking')
  }

  // Factor 2: first-time client
  if (input.totalVisits <= 1) {
    score += 25
    reasons.push('First-time client')
  }

  // Factor 3: prior no-shows
  if (input.priorNoShows >= 2) {
    score += 35
    reasons.push('Multiple past no-shows')
  } else if (input.priorNoShows === 1) {
    score += 20
    reasons.push('Prior no-show on record')
  }

  // Factor 4: prior cancellations
  if (input.priorCancellations >= 3) {
    score += 20
    reasons.push('Frequent cancellations')
  } else if (input.priorCancellations >= 1) {
    score += 10
    reasons.push('Prior cancellation')
  }

  // Factor 5: late-night slot (7 PM+)
  const hour = parseInt(input.appointmentTime.split(':')[0], 10)
  if (hour >= 19) {
    score += 15
    reasons.push('Late-night slot')
  }

  const risk: NoShowRisk = score >= 50 ? 'high' : score >= 25 ? 'medium' : 'low'
  return { risk, score: Math.min(score, 100), reasons }
}

export const RISK_LABEL: Record<NoShowRisk, string> = {
  low:    'Low Risk',
  medium: 'Med Risk',
  high:   'High Risk',
}

export const RISK_CLASS: Record<NoShowRisk, string> = {
  low:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  high:   'bg-red-500/15 text-red-400 border-red-500/30',
}
