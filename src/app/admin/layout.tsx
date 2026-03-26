'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Calendar, Scissors, Clock,
  Users, Settings, ArrowLeft, LogOut, Menu, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { label: 'Dashboard',    href: '/admin',              icon: LayoutDashboard },
  { label: 'Appointments', href: '/admin/appointments', icon: Calendar },
  { label: 'Customers',    href: '/admin/customers',    icon: Users },
  { label: 'Services',     href: '/admin/services',     icon: Scissors },
  { label: 'Availability', href: '/admin/availability', icon: Clock },
  { label: 'Settings',     href: '/admin/settings',     icon: Settings },
]

// Bottom nav shows 5 items max — put Settings inside the sidebar drawer only
const bottomNavItems = navItems.slice(0, 5)

const pageTitles: Record<string, string> = {
  '/admin':              'Dashboard',
  '/admin/appointments': 'Appointments',
  '/admin/services':     'Services',
  '/admin/availability': 'Availability',
  '/admin/customers':    'Customers',
  '/admin/settings':     'Settings',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const pageTitle = pageTitles[pathname] ?? 'Admin'

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? '')
    })
  }, [])

  const handleSignOut = async () => {
    await createClient().auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <div className="min-h-screen bg-charcoal-950">

      {/* ── Desktop sidebar (lg+) ─────────────────────────── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-56 flex-col bg-charcoal-900 border-r border-white/8 z-40">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/8">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-gold flex items-center justify-center flex-shrink-0">
              <Scissors className="w-3.5 h-3.5 text-charcoal-950" />
            </div>
            <div>
              <div className="font-display text-sm font-bold text-white leading-tight">Aryan Blendz</div>
              <div className="text-[10px] text-white/30">Admin</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/20'
                    : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent',
                )}
              >
                <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-gold-400' : 'text-white/35')} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-2 pb-4 pt-3 border-t border-white/8 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/35 hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft className="w-4 h-4" />
            Back to site
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-white/35 hover:text-red-400 hover:bg-red-500/8 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
          {userEmail && (
            <div className="px-3 py-2">
              <p className="text-white/20 text-xs truncate">{userEmail}</p>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile drawer overlay ──────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside
            className="absolute left-0 inset-y-0 w-64 bg-charcoal-900 border-r border-white/8 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-5 border-b border-white/8 flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setDrawerOpen(false)}>
                <div className="w-7 h-7 rounded-lg bg-gradient-gold flex items-center justify-center">
                  <Scissors className="w-3.5 h-3.5 text-charcoal-950" />
                </div>
                <div>
                  <div className="font-display text-sm font-bold text-white">Aryan Blendz</div>
                  <div className="text-[10px] text-white/30">Admin</div>
                </div>
              </Link>
              <button onClick={() => setDrawerOpen(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all',
                      active
                        ? 'bg-gold-500/15 text-gold-400 border border-gold-500/20'
                        : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent',
                    )}
                  >
                    <Icon className={cn('w-4 h-4', active ? 'text-gold-400' : 'text-white/35')} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="px-2 pb-6 pt-3 border-t border-white/8 space-y-1">
              <Link href="/" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all">
                <ArrowLeft className="w-4 h-4" />
                Back to site
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/8 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
              {userEmail && (
                <div className="px-3 py-1">
                  <p className="text-white/20 text-xs truncate">{userEmail}</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ── Main content area ─────────────────────────────── */}
      <div className="lg:pl-56 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 bg-charcoal-900/90 backdrop-blur-sm border-b border-white/8 flex items-center px-4 gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden text-white/50 hover:text-white transition-colors p-1 -ml-1"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="flex-1 font-display text-base font-bold text-white">{pageTitle}</h1>

          {/* Desktop: sign out shortcut */}
          <button
            onClick={handleSignOut}
            className="hidden lg:flex items-center gap-1.5 text-white/25 hover:text-red-400 text-xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </header>

        {/* Page content — extra bottom padding on mobile for the tab bar */}
        <main className="flex-1 p-4 pb-24 lg:pb-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom tab bar ──────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-charcoal-900/95 backdrop-blur-md border-t border-white/10 pb-safe-0">
        <div className="flex items-stretch h-16">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                  active ? 'text-gold-400' : 'text-white/30 active:text-white/60',
                )}
              >
                <Icon className={cn('w-5 h-5', active && 'text-gold-400')} />
                <span>{item.label}</span>
                {active && <span className="absolute bottom-0 w-8 h-0.5 bg-gold-500 rounded-full" />}
              </Link>
            )
          })}
          {/* More button → opens drawer */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-white/30 active:text-white/60 transition-colors"
          >
            <Menu className="w-5 h-5" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
