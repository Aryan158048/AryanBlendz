import { Suspense } from 'react'
import ManageBookingClient from './ManageBookingClient'
import { Skeleton } from '@/components/ui/skeleton'

export default function ManagePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-charcoal-950 pt-24 pb-16 flex items-center justify-center">
          <div className="w-full max-w-lg px-4 space-y-4">
            <Skeleton className="h-8 w-48 bg-charcoal-800" />
            <Skeleton className="h-64 w-full rounded-2xl bg-charcoal-800" />
          </div>
        </div>
      }
    >
      <ManageBookingClient />
    </Suspense>
  )
}
