'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp, Users, DollarSign, AlertTriangle,
  RefreshCw, Loader2, Calendar, Scissors, Clock,
  UserCheck, BarChart2,
} from 'lucide-react'
import { adminGetInsightsData, type InsightsData } from '@/app/actions/insights'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOUR_LABELS = [
  '12a','1a','2a','3a','4a','5a','6a','7a','8a','9a','10a','11a',
  '12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p','11p',
]

function pct(n: number): string {
  return (n * 100).toFixed(0) + '%'
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function HeatBar({ value, max, color }: { value: number; max: number; color: string }) {
  const w = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${w}%` }} />
    </div>
  )
}

export default function InsightsPage() {
  const [data, setData]       = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    adminGetInsightsData()
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 text-gold-400 animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <BarChart2 className="w-10 h-10 text-white/15 mx-auto mb-3" />
        <p className="text-white/40 text-sm">No data yet. Book a few appointments first.</p>
      </div>
    )
  }

  const maxHourly = Math.max(...data.hourlyBookings, 1)
  const maxDaily  = Math.max(...data.dailyBookings,  1)

  // Only show hours that have at least 1 booking
  const activeHours = data.hourlyBookings
    .map((cnt, i) => ({ hour: i, cnt }))
    .filter((h) => h.cnt > 0)

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white">AI Insights</h2>
          <p className="text-white/35 text-xs mt-0.5">Last 90 days · rule-based analysis</p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={load}>
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            icon: DollarSign,
            label: 'Revenue (90d)',
            value: `$${data.totalRevenue.toFixed(0)}`,
            sub: `${data.completedBookings} completed`,
          },
          {
            icon: UserCheck,
            label: 'Repeat Rate',
            value: pct(data.repeatRate),
            sub: `${data.repeatCustomers} / ${data.totalCustomers} clients`,
          },
          {
            icon: AlertTriangle,
            label: 'No-show Rate',
            value: pct(data.noShowRate),
            sub: `${data.totalBookings} total bookings`,
          },
          {
            icon: TrendingUp,
            label: 'Peak Day',
            value: data.peakDay,
            sub: `${data.dailyBookings[DAY_NAMES.indexOf(data.peakDay)] ?? 0} bookings`,
          },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="glass gold-border rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/35 text-xs font-medium">{label}</span>
              <div className="w-7 h-7 rounded-lg bg-gold-500/10 flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-gold-500" />
              </div>
            </div>
            <div className="font-display text-2xl font-bold text-white leading-none">{value}</div>
            <div className="text-white/25 text-xs mt-1">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Hourly heatmap */}
        <div className="glass gold-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-gold-500" />
            <h3 className="font-display text-sm font-bold text-white">Bookings by Hour</h3>
          </div>
          {activeHours.length === 0 ? (
            <p className="text-white/30 text-xs text-center py-8">No booking data yet</p>
          ) : (
            <div className="space-y-2">
              {activeHours.map(({ hour, cnt }) => (
                <div key={hour} className="flex items-center gap-3">
                  <span className="text-white/35 text-[11px] w-8 text-right font-mono flex-shrink-0">
                    {HOUR_LABELS[hour]}
                  </span>
                  <div className="flex-1">
                    <HeatBar
                      value={cnt}
                      max={maxHourly}
                      color={cnt === maxHourly ? 'bg-gold-500' : cnt >= maxHourly * 0.6 ? 'bg-gold-500/70' : 'bg-white/25'}
                    />
                  </div>
                  <span className="text-white/40 text-[11px] w-5 text-right flex-shrink-0">{cnt}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Day of week breakdown */}
        <div className="glass gold-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-gold-500" />
            <h3 className="font-display text-sm font-bold text-white">Bookings by Day</h3>
          </div>
          <div className="space-y-2.5">
            {DAY_NAMES.map((day, i) => {
              const cnt = data.dailyBookings[i]
              const isPeak = day === data.peakDay
              return (
                <div key={day} className="flex items-center gap-3">
                  <span className={`text-[11px] w-8 flex-shrink-0 font-medium ${isPeak ? 'text-gold-400' : 'text-white/35'}`}>
                    {day}
                  </span>
                  <div className="flex-1">
                    <HeatBar
                      value={cnt}
                      max={maxDaily}
                      color={isPeak ? 'bg-gold-500' : cnt >= maxDaily * 0.6 ? 'bg-gold-500/60' : 'bg-white/20'}
                    />
                  </div>
                  <span className="text-white/40 text-[11px] w-5 text-right flex-shrink-0">{cnt}</span>
                  {isPeak && (
                    <span className="text-[9px] text-gold-400 font-medium flex-shrink-0">PEAK</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Top services */}
      <div className="glass gold-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3.5 border-b border-white/8">
          <Scissors className="w-4 h-4 text-gold-500" />
          <h3 className="font-display text-sm font-bold text-white">Top Services</h3>
        </div>
        {data.topServices.length === 0 ? (
          <p className="text-white/30 text-xs text-center py-8">No service data yet</p>
        ) : (
          <div className="divide-y divide-white/5">
            {data.topServices.map((svc, i) => (
              <div key={svc.name} className="flex items-center gap-3 px-4 py-3">
                <div className="w-6 h-6 rounded-full bg-gold-500/10 flex items-center justify-center text-[10px] font-bold text-gold-400 flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{svc.name}</div>
                  <div className="text-white/30 text-xs capitalize">{svc.category}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-white/70 text-sm font-medium">{svc.count}×</div>
                  <div className="text-white/30 text-xs">${svc.revenue.toFixed(0)} rev</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rebooking predictions */}
      <div className="glass gold-border rounded-2xl overflow-hidden">
        <div className="px-4 py-3.5 border-b border-white/8">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gold-500" />
            <h3 className="font-display text-sm font-bold text-white">Due for a Cut</h3>
          </div>
          <p className="text-white/30 text-xs mt-0.5">
            Clients predicted ready based on service cycle · {data.dueForRebooking.length} found
          </p>
        </div>

        {data.dueForRebooking.length === 0 ? (
          <div className="py-10 text-center">
            <UserCheck className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-white/30 text-sm">No clients due in the next 2 weeks</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {data.dueForRebooking.map((c) => {
              const daysUntilDue = c.cycledays - c.daysSince
              return (
                <div key={c.email} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-xs font-bold text-gold-400 flex-shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{c.name}</div>
                    <div className="text-white/35 text-xs truncate">
                      {c.lastService} · last visit {fmtDate(c.lastVisit)}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <Badge className={`text-[10px] px-2 py-0.5 border ${c.overdue ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'}`}>
                      {c.overdue
                        ? `${c.daysSince - c.cycledays}d overdue`
                        : `due in ${daysUntilDue}d`}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ML feature explanation footer */}
      <div className="glass rounded-xl p-4 border border-white/5">
        <p className="text-white/20 text-[11px] leading-relaxed">
          <span className="text-white/40 font-medium">How this works:</span> All analysis is rule-based using your real appointment history.
          No-show risk scoring, slot popularity, and rebooking predictions are computed from
          patterns in the past 90 days — no external AI credits required. Upgrade to a trained
          model (XGBoost / logistic regression) to increase prediction accuracy.
        </p>
      </div>

    </div>
  )
}
