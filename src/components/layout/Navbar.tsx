'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Scissors } from 'lucide-react'

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
  const pathname = usePathname()

  // Don't render on pages that have their own header
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/booking')
  ) return null

  return (
    <nav
      className={[
        'fixed top-0 left-0 w-full z-50 transition-all duration-300',
        scrolled
          ? 'bg-charcoal-950/95 backdrop-blur-md border-b border-white/5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]'
          : 'bg-transparent',
      ].join(' ')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0" aria-label="Aryan Blendz">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-md bg-gold-500/10 border border-gold-500/20 group-hover:bg-gold-500/20 transition-all duration-200">
              <Scissors size={16} className="text-gold-500 rotate-[-45deg] group-hover:rotate-0 transition-transform duration-300" strokeWidth={2} />
            </div>
            <span className="text-sm font-semibold tracking-[0.15em] uppercase select-none">
              <span className="text-white">ARYAN</span>
              <span className="text-gold-500"> BLENDZ</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Rutgers students schedule matcher */}
            <Link
              href="/schedule"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              <span className="w-2 h-2 rounded-full bg-[#CC0033]" />
              Rutgers Schedule
            </Link>

            {/* Book Now */}
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold tracking-wide text-charcoal-950 bg-gold-500 hover:bg-gold-400 active:bg-gold-600 transition-all duration-200 shadow-[0_4px_24px_-4px_rgba(201,168,76,0.35)]"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
