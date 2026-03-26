import { ScheduleSelectionClient } from '@/components/schedule/ScheduleSelectionClient'

export const metadata = {
  title: 'Schedule Matcher | Aryan Blendz',
  description:
    'Mark your availability and find appointment times that work around your schedule.',
}

export default function SchedulePage() {
  return (
    <main className="min-h-screen bg-charcoal-950 pb-24">
      <ScheduleSelectionClient />
    </main>
  )
}
