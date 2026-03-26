import Link from 'next/link'
import { Scissors, Share2, Globe, MapPin, Phone, Mail, Clock } from 'lucide-react'

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Booking', href: '/booking' },
  { label: 'About', href: '/about' },
]

const hours = [
  { day: 'Mon – Fri', time: '9:00 AM – 7:00 PM' },
  { day: 'Saturday', time: '8:00 AM – 6:00 PM' },
  { day: 'Sunday', time: 'Closed' },
]

const contact = [
  {
    icon: MapPin,
    label: 'Judson Suites, 103 Davidson Rd, Piscataway, NJ 08854',
    href: 'https://maps.google.com/maps?q=103+Davidson+Rd,+Piscataway,+NJ+08854',
  },
  {
    icon: Phone,
    label: '201-748-9849',
    href: 'tel:+12017489849',
  },
  {
    icon: Mail,
    label: 'hello@aryanblendz.com',
    href: 'mailto:hello@aryanblendz.com',
  },
]

export default function Footer() {
  return (
    <footer className="bg-charcoal-950 border-t border-white/5">
      {/* Top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            <Link
              href="/"
              className="flex items-center gap-2.5 group w-fit"
              aria-label="Aryan Blendz"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gold-500/10 border border-gold-500/20 group-hover:bg-gold-500/20 transition-all duration-200">
                <Scissors
                  size={16}
                  className="text-gold-500 rotate-[-45deg]"
                  strokeWidth={2}
                />
              </div>
              <span className="text-sm font-semibold tracking-[0.15em] uppercase">
                <span className="text-white">ARYAN</span>
                <span className="text-gold-500"> BLENDZ</span>
              </span>
            </Link>

            <p className="text-sm text-white/50 leading-relaxed max-w-[220px]">
              Sharp cuts from your campus. Book with Aryan in seconds — no waiting, no walk-in stress.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.instagram.com/aryanblendz/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow @aryanblendz on Instagram"
                className="flex items-center justify-center w-9 h-9 rounded-md bg-white/5 border border-white/8 text-white/50 hover:text-gold-400 hover:bg-gold-500/10 hover:border-gold-500/30 transition-all duration-200"
              >
                <Share2 size={16} strokeWidth={2} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-5">
            <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-gold-500">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-200 inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-3 h-px bg-gold-500/0 group-hover:bg-gold-500/60 transition-all duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div className="flex flex-col gap-5">
            <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-gold-500">
              Hours
            </h3>
            <ul className="flex flex-col gap-3">
              {hours.map(({ day, time }) => (
                <li key={day} className="flex items-start justify-between gap-4">
                  <span className="text-sm text-white/50 whitespace-nowrap">{day}</span>
                  <span
                    className={[
                      'text-sm text-right',
                      time === 'Closed' ? 'text-white/30' : 'text-white/80',
                    ].join(' ')}
                  >
                    {time}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 pt-1">
              <Clock size={13} className="text-gold-500/70 flex-shrink-0" strokeWidth={2} />
              <span className="text-xs text-white/30">Appointment only</span>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-5">
            <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-gold-500">
              Contact
            </h3>
            <ul className="flex flex-col gap-4">
              {contact.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-start gap-3 text-sm text-white/50 hover:text-white/80 transition-colors duration-200 group"
                  >
                    <Icon
                      size={14}
                      className="text-gold-500/70 flex-shrink-0 mt-0.5 group-hover:text-gold-400 transition-colors duration-200"
                      strokeWidth={2}
                    />
                    <span className="leading-snug">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Aryan Blendz. All rights reserved.
          </p>
          <p className="text-xs text-white/20">
            Crafted with precision.
          </p>
        </div>
      </div>
    </footer>
  )
}
