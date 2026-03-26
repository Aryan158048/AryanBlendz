import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus
  className?: string
}

const statusConfig: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
  no_show: {
    label: 'No Show',
    className: 'bg-charcoal-600/40 text-white/40 border-white/10',
  },
}

export function AppointmentStatusBadge({
  status,
  className,
}: AppointmentStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      className={cn(
        'border text-xs font-semibold px-2.5 py-0.5',
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  )
}
