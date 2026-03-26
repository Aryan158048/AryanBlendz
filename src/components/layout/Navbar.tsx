'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Scissors, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}

export default function Navbar() {
  const scrolled = useScrolled()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  // Auth state
  useEffect(() => {
    const supabase = createClient()

    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
        setIsAdmin(data?.role === 'admin')
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setIsAdmin(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    setUserMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const userInitial = user?.user_metadata?.full_name?.[0]?.toUpperCase()
    ?? user?.email?.[0]?.toUpperCase()
    ?? '?'

  return (
    <>
      <nav
        className={[
          'fixed top-0 left-0 w-full z-50 transition-all duration-300',
          scrolled
            ? 'bg-charcoal-950/95 backdrop-blur-md border-b border-white/5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]'
            : 'bg-transparent',
        ].join(' ')}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group flex-shrink-0"
              aria-label="Aryan Blendz — Home"
            >
              <div className="relative flex items-center justify-center w-8 h-8 rounded-md bg-gold-500/10 border border-gold-500/20 group-hover:bg-gold-500/20 group-hover:border-gold-500/40 transition-all duration-200">
                <Scissors
                  size={16}
                  className="text-gold-500 rotate-[-45deg] group-hover:rotate-0 transition-transform duration-300"
                  strokeWidth={2}
                />
              </div>
              <span className="text-sm font-semibold tracking-[0.15em] uppercase select-none">
                <span className="text-white">ARYAN</span>
                <span className="text-gold-500"> BLENDZ</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={[
                    'relative px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-200',
                    'after:absolute after:bottom-0 after:left-4 after:right-4 after:h-px after:bg-gold-500',
                    'after:transition-transform after:duration-200 after:origin-left',
                    isActive(href)
                      ? 'text-gold-400 after:scale-x-100'
                      : 'text-white/70 hover:text-white after:scale-x-0 hover:after:scale-x-100',
                  ].join(' ')}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold tracking-wide text-charcoal-950 bg-gold-500 hover:bg-gold-400 active:bg-gold-600 transition-all duration-200 shadow-[0_4px_24px_-4px_rgba(201,168,76,0.35)] hover:shadow-[0_8px_40px_-8px_rgba(201,168,76,0.5)] hover:-translate-y-0.5"
              >
                Book Now
              </Link>

              {/* Auth area */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-500/30 to-gold-600/10 border border-gold-500/30 flex items-center justify-center text-gold-400 font-semibold text-sm hover:border-gold-500/60 transition-all"
                  >
                    {userInitial}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-12 w-48 bg-charcoal-900 border border-white/10 rounded-xl shadow-[var(--shadow-dark-lg)] overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-white/8">
                        <p className="text-white text-xs font-medium truncate">
                          {user.user_metadata?.full_name ?? 'Account'}
                        </p>
                        <p className="text-white/40 text-xs truncate">{user.email}</p>
                      </div>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gold-400 hover:bg-gold-500/10 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/account"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        My Account
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/8"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-medium text-white/60 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden relative flex items-center justify-center w-10 h-10 rounded-md text-white/80 hover:text-white hover:bg-white/5 transition-colors duration-200"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <span
                className={[
                  'absolute inset-0 flex items-center justify-center transition-all duration-200',
                  mobileOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90',
                ].join(' ')}
              >
                <X size={20} strokeWidth={2} />
              </span>
              <span
                className={[
                  'absolute inset-0 flex items-center justify-center transition-all duration-200',
                  mobileOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0',
                ].join(' ')}
              >
                <Menu size={20} strokeWidth={2} />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={[
            'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
            mobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0',
          ].join(' ')}
        >
          <div className="bg-charcoal-950/98 backdrop-blur-md border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={[
                    'flex items-center px-4 py-3 rounded-lg text-sm font-medium tracking-wide transition-colors duration-200',
                    isActive(href)
                      ? 'text-gold-400 bg-gold-500/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5',
                  ].join(' ')}
                >
                  {isActive(href) && (
                    <span className="mr-3 w-1 h-1 rounded-full bg-gold-500 flex-shrink-0" />
                  )}
                  {label}
                </Link>
              ))}
              <div className="pt-3 pb-1 flex flex-col gap-2">
                <Link
                  href="/booking"
                  className="flex items-center justify-center w-full py-3 rounded-md text-sm font-semibold tracking-wide text-charcoal-950 bg-gold-500 hover:bg-gold-400 transition-colors duration-200"
                >
                  Book Now
                </Link>
                {user ? (
                  <>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md text-sm font-medium text-gold-400 border border-gold-500/30 hover:bg-gold-500/10 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/account"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md text-sm font-medium text-white/70 border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Account
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md text-sm font-medium text-red-400/70 border border-red-500/20 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center justify-center w-full py-2.5 rounded-md text-sm font-medium text-white/70 border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Close user menu on outside click */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </>
  )
}
