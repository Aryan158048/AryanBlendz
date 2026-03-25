'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  User,
  Settings,
  LogOut,
  Scissors,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { AppointmentCard, type Appointment } from '@/components/account/AppointmentCard'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

const mockUpcoming: Appointment[] = [
  {
    id: '1',
    service: 'Haircut',
    barber: 'Aryan',
    date: '2026-04-12',
    time: '10:00 AM',
    status: 'confirmed',
    price: 35,
    confirmationCode: 'AB-7829',
  },
  {
    id: '2',
    service: 'Beard Trim',
    barber: 'Marcus',
    date: '2026-04-20',
    time: '2:30 PM',
    status: 'pending',
    price: 25,
    confirmationCode: 'AB-4521',
  },
]

const mockPast: Appointment[] = [
  {
    id: '3',
    service: 'Haircut + Beard',
    barber: 'Aryan',
    date: '2026-03-10',
    time: '11:00 AM',
    status: 'completed',
    price: 55,
    confirmationCode: 'AB-1234',
  },
  {
    id: '4',
    service: 'Premium Package',
    barber: 'Jordan',
    date: '2026-02-22',
    time: '3:00 PM',
    status: 'completed',
    price: 75,
    confirmationCode: 'AB-9087',
  },
]

interface UserProfile {
  name: string
  email: string
  initials: string
  memberSince?: string
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export default function AccountPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(true)
  const [user, setUser] = React.useState<UserProfile | null>(null)
  const [upcomingAppointments, setUpcomingAppointments] = React.useState<Appointment[]>([])
  const [pastAppointments, setPastAppointments] = React.useState<Appointment[]>([])

  React.useEffect(() => {
    const init = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user: supabaseUser },
        } = await supabase.auth.getUser()

        if (!supabaseUser) {
          router.replace('/login')
          return
        }

        const fullName =
          supabaseUser.user_metadata?.full_name ?? supabaseUser.email ?? 'Guest'

        setUser({
          name: fullName,
          email: supabaseUser.email ?? '',
          initials: getInitials(fullName),
          memberSince: supabaseUser.created_at,
        })
      } catch {
        // Supabase not configured — use mock data for dev
        setUser({
          name: 'Jordan Williams',
          email: 'jordan@example.com',
          initials: 'JW',
          memberSince: '2025-06-01',
        })
      } finally {
        setUpcomingAppointments(mockUpcoming)
        setPastAppointments(mockPast)
        setIsLoading(false)
      }
    }

    init()
  }, [router])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      toast.success('Signed out successfully')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Failed to sign out. Please try again.')
    }
  }

  const handleCancelAppointment = async (id: string) => {
    const target = upcomingAppointments.find((a) => a.id === id)
    if (!target) return

    // Optimistic: remove from upcoming, add as cancelled to past
    setUpcomingAppointments((prev) => prev.filter((a) => a.id !== id))
    setPastAppointments((prev) => [
      { ...target, status: 'cancelled' as const },
      ...prev,
    ])
    toast.success('Appointment cancelled successfully.')
  }

  const handleBookAgain = (appointment: Appointment) => {
    router.push(
      `/booking?service=${encodeURIComponent(appointment.service)}&barber=${encodeURIComponent(appointment.barber)}`,
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-950 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 mb-10">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const completedCount = pastAppointments.filter(
    (a) => a.status === 'completed',
  ).length

  return (
    <div className="min-h-screen bg-charcoal-950 pb-16">
      {/* Page header */}
      <div className="border-b border-white/6 bg-charcoal-900/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            {/* User info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-500/30 to-gold-600/10 border border-gold-500/30 flex items-center justify-center shadow-[0_0_24px_rgba(201,168,76,0.12)] flex-shrink-0">
                <span className="text-gold-400 font-semibold text-lg font-display">
                  {user?.initials}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">
                  {user?.name}
                </h1>
                <p className="text-white/40 text-sm mt-0.5">{user?.email}</p>
                {user?.memberSince && (
                  <p className="text-white/25 text-xs mt-0.5">
                    Member since {formatDate(user.memberSince, 'MMMM yyyy')}
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/account/profile">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/50 hover:text-red-400 hover:bg-red-500/10"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              {
                label: 'Upcoming',
                value: upcomingAppointments.length,
                icon: CalendarDays,
              },
              {
                label: 'Completed',
                value: completedCount,
                icon: Scissors,
              },
              {
                label: 'Profile',
                value: 'Edit',
                icon: User,
                href: '/account/profile',
              },
            ].map(({ label, value, icon: Icon, href }) => (
              <div
                key={label}
                className="rounded-xl bg-charcoal-800 border border-white/6 p-3.5 text-center"
              >
                <Icon
                  className="w-4 h-4 text-gold-400/60 mx-auto mb-1.5"
                  strokeWidth={1.5}
                />
                <div className="text-lg font-semibold text-white leading-tight">
                  {href ? (
                    <Link
                      href={href}
                      className="text-gold-400 hover:text-gold-300 transition-colors text-sm"
                    >
                      {value}
                    </Link>
                  ) : (
                    value
                  )}
                </div>
                <div className="text-xs text-white/35 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">My Appointments</h2>
          <Button size="sm" asChild>
            <Link href="/booking">
              <Plus className="w-4 h-4" />
              Book New
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming" className="gap-2">
              <CalendarDays className="w-4 h-4" />
              Upcoming
              {upcomingAppointments.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 text-xs font-medium leading-none min-w-[1.25rem]">
                  {upcomingAppointments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="past">Past Appointments</TabsTrigger>
          </TabsList>

          {/* Upcoming */}
          <TabsContent value="upcoming">
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    variant="upcoming"
                    onCancel={handleCancelAppointment}
                  />
                ))}
              </div>
            ) : (
              <UpcomingEmptyState />
            )}
          </TabsContent>

          {/* Past */}
          <TabsContent value="past">
            {pastAppointments.length > 0 ? (
              <div className="space-y-3">
                {pastAppointments.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    variant="past"
                    onBookAgain={handleBookAgain}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Scissors
                  className="w-10 h-10 mx-auto mb-3 text-white/20"
                  strokeWidth={1}
                />
                <p className="text-sm text-white/40">No past appointments yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function UpcomingEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gold-500/8 border border-gold-500/15 flex items-center justify-center mb-5">
        <CalendarDays
          className="w-8 h-8 text-gold-400/50"
          strokeWidth={1.25}
        />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">
        No upcoming appointments
      </h3>
      <p className="text-white/40 text-sm mb-6 max-w-xs leading-relaxed">
        You don&apos;t have any scheduled visits. Book your next premium session
        now.
      </p>
      <Button asChild>
        <Link href="/booking">
          <Scissors className="w-4 h-4" />
          Book an Appointment
        </Link>
      </Button>
    </div>
  )
}
