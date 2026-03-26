import Link from 'next/link'
import { Clock, MapPin, Phone, Mail, ExternalLink } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPublicHours } from '@/app/actions/booking'

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_ORDER  = [1, 2, 3, 4, 5, 6, 0] // Mon → Sun

function fmt12h(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

async function getShopContact() {
  try {
    const admin = createAdminClient()
    const { data } = await admin.from('settings').select('key, value')
    const map: Record<string, string> = {}
    for (const row of data ?? []) {
      try { map[row.key] = JSON.parse(row.value) } catch { map[row.key] = row.value }
    }
    return {
      address:   map.shop_address ?? '',
      phone:     map.shop_phone   ?? '',
      email:     map.shop_email   ?? '',
    }
  } catch {
    return { address: '', phone: '', email: '' }
  }
}

export default async function LocationSection() {
  const [hours, contact] = await Promise.all([getPublicHours(), getShopContact()])

  const mapsUrl = contact.address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(contact.address)}`
    : 'https://maps.google.com'

  const contactRows = [
    contact.address && { icon: MapPin, text: contact.address,  href: mapsUrl },
    contact.phone   && { icon: Phone,  text: contact.phone,    href: `tel:${contact.phone.replace(/\D/g, '')}` },
    contact.email   && { icon: Mail,   text: contact.email,    href: `mailto:${contact.email}` },
  ].filter(Boolean) as { icon: React.ElementType; text: string; href: string }[]

  return (
    <section className="py-24 bg-charcoal-950 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold-500 mb-3">
            Find Me
          </p>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
            style={{ fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif' }}
          >
            Come See Me
          </h2>
          <div className="flex items-center justify-center gap-2 mt-5">
            <span className="h-px w-12 bg-gold-500/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
            <span className="h-px w-12 bg-gold-500/40" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">

          {/* Hours card */}
          <div className="flex flex-col gap-6 p-7 rounded-xl bg-charcoal-800 border border-white/6 hover:border-gold-500/20 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                <Clock size={18} className="text-gold-400" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Opening Hours</h3>
                <p className="text-xs text-white/35 mt-0.5">Appointment only</p>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            <ul className="flex flex-col gap-3">
              {hours.length > 0 ? DAY_ORDER.map((dayNum) => {
                const row  = hours.find((h) => h.day_of_week === dayNum)
                const open = row?.is_available ?? false
                return (
                  <li key={dayNum} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-white/55 w-24 flex-shrink-0">{DAY_LABELS[dayNum]}</span>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${open ? 'bg-emerald-500/70' : 'bg-white/20'}`} />
                      <span className={`text-sm font-medium ${open ? 'text-white/80' : 'text-white/25'}`}>
                        {open && row ? `${fmt12h(row.start_time)} – ${fmt12h(row.end_time)}` : 'Closed'}
                      </span>
                    </div>
                  </li>
                )
              }) : (
                <li className="text-sm text-white/30">Hours not set — configure in admin.</li>
              )}
            </ul>

            <div className="mt-auto">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center w-full py-3 rounded-md text-sm font-semibold tracking-wide text-charcoal-950 bg-gold-500 hover:bg-gold-400 transition-colors duration-200"
              >
                Book an Appointment
              </Link>
            </div>
          </div>

          {/* Location card */}
          <div className="flex flex-col gap-6 p-7 rounded-xl bg-charcoal-800 border border-white/6 hover:border-gold-500/20 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                <MapPin size={18} className="text-gold-400" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Location</h3>
                <p className="text-xs text-white/35 mt-0.5">Piscataway, NJ</p>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Map placeholder */}
            <div className="relative rounded-lg overflow-hidden bg-charcoal-900 border border-white/5 h-28 flex items-center justify-center">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />
              <div className="relative flex flex-col items-center gap-1.5">
                <MapPin size={22} className="text-gold-400" strokeWidth={2} />
                {contact.address && (
                  <span className="text-xs text-white/40 text-center px-4">{contact.address}</span>
                )}
              </div>
            </div>

            {/* Contact info */}
            {contactRows.length > 0 && (
              <ul className="flex flex-col gap-3">
                {contactRows.map(({ icon: Icon, text, href }) => (
                  <li key={text}>
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
                      <span>{text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-auto">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full gap-2 py-3 rounded-md text-sm font-semibold tracking-wide text-gold-400 border border-gold-500/30 hover:border-gold-500/60 hover:text-gold-300 transition-all duration-200 group"
              >
                Get Directions
                <ExternalLink size={13} strokeWidth={2.5} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
