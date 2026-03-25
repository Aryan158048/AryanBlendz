'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Scissors, Menu, X } from 'lucide-react'

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
  const pathname = usePathname()

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

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
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold tracking-wide text-charcoal-950 bg-gold-500 hover:bg-gold-400 active:bg-gold-600 transition-all duration-200 shadow-[0_4px_24px_-4px_rgba(201,168,76,0.35)] hover:shadow-[0_8px_40px_-8px_rgba(201,168,76,0.5)] hover:-translate-y-0.5"
              >
                Book Now
              </Link>
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
              <div className="pt-3 pb-1">
                <Link
                  href="/booking"
                  className="flex items-center justify-center w-full py-3 rounded-md text-sm font-semibold tracking-wide text-charcoal-950 bg-gold-500 hover:bg-gold-400 transition-colors duration-200"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
