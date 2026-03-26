import Link from 'next/link'
import { Scissors, Share2, MapPin, Phone, Mail, Clock } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

const quickLinks = [
  { label: 'Home',     href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Booking',  href: '/booking' },
  { label: 'About',    href: '/about' },
]

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0] // Mon–Sat, then Sun

function fmt12h(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

async function getFooterData() {
  const admin = createAdminClient()
  const [settingsRes, barberRes, availRes] = await Promise.all([
    admin.from('settings').select('key, value'),
    admin.from('barbers').select('id, instagram').eq('is_active', true).limit(1).single(),
    admin.from('barbers').select('id').eq('is_active', true).limit(1).single(),
  ])

  const map: Record<string, string> = {}
  for (const row of settingsRes.data ?? []) {
    try { map[row.key] = JSON.parse(row.value) } catch { map[row.key] = row.value }
  }

  const barberId = barberRes.data?.id ?? availRes.data?.id
  let hours: { day_of_week: number; start_time: string; end_time: string; is_available: boolean }[] = []
  if (barberId) {
    const { data } = await admin
      .from('availability')
      .select('day_of_week, start_time, end_time, is_available')
      .eq('barber_id', barberId)
      .order('day_of_week')
    hours = (data ?? []) as typeof hours
  }

  return {
    shopName:  map.shop_name    ?? 'Aryan Blendz',
    address:   map.shop_address ?? '',
    phone:     map.shop_phone   ?? '',
    email:     map.shop_email   ?? '',
    instagram: barberRes.data?.instagram ?? map.shop_instagram ?? '',
    hours,
  }
}

export default async function Footer() {
  const { shopName, address, phone, email, instagram, hours } = await getFooterData()

  const contact = [
    address   && { icon: MapPin, label: address,   href: `https://maps.google.com/maps?q=${encodeURIComponent(address)}` },
    phone     && { icon: Phone,  label: phone,      href: `tel:${phone.replace(/\D/g, '')}` },
    email     && { icon: Mail,   label: email,      href: `mailto:${email}` },
  ].filter(Boolean) as { icon: React.ElementType; label: string; href: string }[]

  const instagramUrl = instagram
    ? `https://www.instagram.com/${instagram.replace('@', '')}/`
    : null

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
              aria-label={shopName}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gold-500/10 border border-gold-500/20 group-hover:bg-gold-500/20 transition-all duration-200">
                <Scissors size={16} className="text-gold-500 rotate-[-45deg]" strokeWidth={2} />
              </div>
              <span className="text-sm font-semibold tracking-[0.15em] uppercase">
                <span className="text-white">{shopName.split(' ')[0]?.toUpperCase()}</span>
                <span className="text-gold-500"> {shopName.split(' ').slice(1).join(' ').toUpperCase()}</span>
              </span>
            </Link>

            <p className="text-sm text-white/50 leading-relaxed max-w-[220px]">
              Sharp cuts, zero waiting. Book your appointment online in seconds.
            </p>

            {instagramUrl && (
              <div className="flex items-center gap-3 pt-1">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow ${instagram} on Instagram`}
                  className="flex items-center justify-center w-9 h-9 rounded-md bg-white/5 border border-white/8 text-white/50 hover:text-gold-400 hover:bg-gold-500/10 hover:border-gold-500/30 transition-all duration-200"
                >
                  <Share2 size={16} strokeWidth={2} />
                </a>
              </div>
            )}
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
            {hours.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {DISPLAY_ORDER.map((dayNum) => {
                  const row = hours.find((h) => h.day_of_week === dayNum)
                  const label = DAY_LABELS[dayNum]
                  return (
                    <li key={dayNum} className="flex items-start justify-between gap-4">
                      <span className="text-sm text-white/50 whitespace-nowrap">{label}</span>
                      <span className={['text-sm text-right', row?.is_available ? 'text-white/80' : 'text-white/30'].join(' ')}>
                        {row?.is_available ? `${fmt12h(row.start_time)} – ${fmt12h(row.end_time)}` : 'Closed'}
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-sm text-white/30">See booking page for availability.</p>
            )}
            <div className="flex items-center gap-2 pt-1">
              <Clock size={13} className="text-gold-500/70 flex-shrink-0" strokeWidth={2} />
              <span className="text-xs text-white/30">Appointment only</span>
            </div>
          </div>

          {/* Contact */}
          {contact.length > 0 && (
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
          )}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} {shopName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-white/20">Crafted with precision.</p>
            <Link
              href="/admin"
              className="text-xs text-white/15 hover:text-white/40 transition-colors duration-200"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
