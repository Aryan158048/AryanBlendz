import { ScheduleClient } from './ScheduleClient'

export const metadata = {
  title: 'Schedule Matcher | Aryan Blendz',
  description:
    'Upload your Rutgers schedule and find appointment times that work around your classes.',
}

export default function SchedulePage() {
  return (
    <main className="min-h-screen bg-charcoal-950">
      <ScheduleClient />
    </main>
  )
}
