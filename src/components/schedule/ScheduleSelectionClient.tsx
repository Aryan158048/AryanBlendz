'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { ClientScheduleChooser } from '@/components/schedule/ClientScheduleChooser'
import { ScheduleClient } from '@/app/schedule/ScheduleClient'
import { adminGetWeeklySchedule, getScheduleSettings } from '@/app/actions/schedule'
import type { WeeklySchedule, AvailableSlotsMap, ScheduleSettings } from '@/lib/schedule/types'

export function ScheduleSelectionClient() {
  const router = useRouter()
  const [adminSchedule, setAdminSchedule] = useState<WeeklySchedule | null>(null)
  const [settings, setSettings] = useState<ScheduleSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminGetWeeklySchedule(),
      getScheduleSettings(),
    ]).then(([adminData, settingsData]) => {
      setAdminSchedule(adminData?.schedule ?? null)
      setSettings(settingsData)
      setLoading(false)
    })
  }, [])

  const handleProceed = (clientSchedule: WeeklySchedule, availableSlots: AvailableSlotsMap) => {
    // Store in session and redirect to booking
    sessionStorage.setItem('selectedSlots', JSON.stringify(availableSlots))
    sessionStorage.setItem('clientSchedule', JSON.stringify(clientSchedule))
    router.push('/booking')
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#CC0033] animate-spin" />
          <p className="text-white/60 text-sm">Loading schedule information...</p>
        </div>
      </div>
    )
  }

  if (!adminSchedule || !settings) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="glass gold-border rounded-2xl p-8 text-center space-y-3">
          <p className="text-white font-semibold">Admin Schedule Not Available</p>
          <p className="text-white/50 text-sm">
            The barber hasn't set their schedule yet. Please check back later or contact us directly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="manual" className="w-full">
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-4">
          <div className="space-y-2 mb-6">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Find Your Available Time
            </h1>
            <p className="text-white/45 text-sm max-w-lg">
              Choose your preferred method to share your availability
            </p>
          </div>

          <TabsList className="grid w-full max-w-sm grid-cols-2 bg-white/10 border border-white/20">
            <TabsTrigger value="manual" className="data-[state=active]:bg-[#CC0033] data-[state=active]:text-white">
              Drag & Drop
            </TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-[#CC0033] data-[state=active]:text-white">
              Upload Schedule
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="manual" className="data-[state=active]:animate-fade-in">
          {settings && (
            <ClientScheduleChooser
              adminSchedule={adminSchedule}
              settings={settings}
              onProceed={handleProceed}
              isLoading={false}
            />
          )}
        </TabsContent>

        <TabsContent value="upload" className="">
          <ScheduleClient />
        </TabsContent>
      </Tabs>
    </div>
  )
}
