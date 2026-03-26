'use client'

import * as React from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface CancelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentId: string
  serviceName: string
  appointmentDate: string
  onConfirm: (appointmentId: string) => Promise<void> | void
}

export function CancelDialog({
  open,
  onOpenChange,
  appointmentId,
  serviceName,
  appointmentDate,
  onConfirm,
}: CancelDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleCancel = async () => {
    setIsLoading(true)
    try {
      await onConfirm(appointmentId)
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          {/* Warning icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 mb-4 mx-auto">
            <AlertTriangle className="w-6 h-6 text-red-400" strokeWidth={1.5} />
          </div>

          <DialogTitle className="text-center text-xl">
            Cancel Appointment?
          </DialogTitle>
          <DialogDescription className="text-center space-y-1 pt-1">
            <span className="block text-white/60">
              You&apos;re about to cancel your{' '}
              <span className="text-white font-medium">{serviceName}</span> appointment on{' '}
              <span className="text-white font-medium">{appointmentDate}</span>.
            </span>
            <span className="block text-white/40 text-xs pt-1">
              This action cannot be undone. Cancellations made within 24 hours may be subject to a fee.
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-col gap-2 mt-2">
          <Button
            variant="destructive"
            size="lg"
            className="w-full bg-red-600 hover:bg-red-500"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cancelling…
              </>
            ) : (
              'Yes, Cancel It'
            )}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Keep Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
