import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string
  trend?: string
  trendUp?: boolean
  icon: LucideIcon
  description?: string
  className?: string
}

export function StatsCard({
  title,
  value,
  trend,
  trendUp,
  icon: Icon,
  description,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'glass gold-border rounded-2xl p-5 hover:border-gold-400/30 transition-all duration-200 group',
        className,
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center group-hover:bg-gold-500/15 transition-colors">
          <Icon className="w-5 h-5 text-gold-400" />
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border',
              trendUp
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : 'text-red-400 bg-red-500/10 border-red-500/20',
            )}
          >
            {trendUp ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>

      <div className="font-display text-3xl font-bold text-white mb-1 tabular-nums">
        {value}
      </div>
      <div className="text-white/50 text-sm font-medium">{title}</div>
      {description && (
        <div className="text-white/30 text-xs mt-1">{description}</div>
      )}
    </div>
  )
}
