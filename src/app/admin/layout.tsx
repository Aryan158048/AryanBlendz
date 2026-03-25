'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Clock,
  Users,
  Settings,
  Menu,
  X,
  ArrowLeft,
  Plus,
  ChevronRight,
  Bell,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard',     href: '/admin',               icon: LayoutDashboard },
  { label: 'Appointments',  href: '/admin/appointments',  icon: Calendar },
  { label: 'Customers',     href: '/admin/customers',     icon: Users },
  { label: 'Services',      href: '/admin/services',      icon: Scissors },
  { label: 'Availability',  href: '/admin/availability',  icon: Clock },
  { label: 'Settings',      href: '/admin/settings',      icon: Settings },
]

const pageTitles: Record<string, string> = {
  '/admin':               'Dashboard',
  '/admin/appointments':  'Appointments',
  '/admin/services':      'Services',
  '/admin/availability':  'Availability',
  '/admin/customers':     'Customers',
  '/admin/settings':      'Settings',
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-charcoal-900 border-r border-white/8">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center shadow-[var(--shadow-gold)] flex-shrink-0">
            <Scissors className="w-4 h-4 text-charcoal-950" />
          </div>
          <div>
            <div className="font-display text-sm font-bold text-white leading-tight">
              Aryan Blendz
            </div>
            <div className="text-xs text-white/30 leading-tight">Admin</div>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-gold-500/15 text-gold-400 border border-gold-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent',
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-gold-400' : 'text-white/40')} />
              {item.label}
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-gold-400/50" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-2 border-t border-white/8 pt-4">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all border border-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Site
        </Link>
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-gold flex items-center justify-center flex-shrink-0">
            <span className="text-charcoal-950 text-xs font-bold font-display">A</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white text-xs font-medium truncate">Aryan</div>
            <div className="text-white/30 text-xs truncate">admin@aryanblendz.com</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pageTitle = pageTitles[pathname] ?? 'Admin'

  return (
    <div className="min-h-screen bg-charcoal-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col fixed inset-y-0 left-0 z-40">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside className="absolute left-0 inset-y-0 w-64 z-10" onClick={(e) => e.stopPropagation()}>
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 lg:pl-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-charcoal-900/80 backdrop-blur-sm border-b border-white/8 flex items-center px-4 sm:px-6 sticky top-0 z-30 gap-4">
          {/* Hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white/50 hover:text-white transition-colors p-1"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title */}
          <div className="flex-1">
            <h1 className="font-display text-lg font-bold text-white">{pageTitle}</h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-lg border border-white/10 bg-charcoal-800/60 flex items-center justify-center text-white/40 hover:text-white hover:bg-charcoal-800 transition-all relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold-500" />
            </button>
            <Button size="sm" asChild>
              <Link href="/booking">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Appointment</span>
              </Link>
            </Button>
            <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-charcoal-950 text-xs font-bold font-display cursor-pointer">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
