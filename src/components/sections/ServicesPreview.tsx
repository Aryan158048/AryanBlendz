import Link from 'next/link'
import { Clock, ArrowRight, Scissors, Zap } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

interface DBService {
  id: string
  name: string
  description: string
  price: number
  duration: number
  category: string
}

// Map well-known service names/categories to badges
function getBadge(name: string): string | undefined {
  const n = name.toLowerCase()
  if (n.includes('combo') || n.includes('beard') && n.includes('haircut')) return 'Most Popular'
  if (n.includes('premium')) return 'Best Value'
  return undefined
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}min` : `${h}hr`
}

export default async function ServicesPreview() {
  const admin = createAdminClient()
  const { data } = await admin
    .from('services')
    .select('id, name, description, price, duration, category')
    .eq('is_active', true)
    .order('display_order')
  const services: DBService[] = data ?? []

  return (
    <section className="py-28 bg-charcoal-950 relative overflow-hidden">
      {/* Top edge */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gold-900/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="h-px w-8 bg-gold-500/40" />
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-gold-500">
              What I Offer
            </p>
            <span className="h-px w-8 bg-gold-500/40" />
          </div>
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-5"
            style={{ fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif' }}
          >
            My Services
          </h2>
          <p className="text-white/45 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Every service delivered with precision, care, and the attention to detail you deserve.
          </p>
        </div>

        {/* Cards */}
        {services.length === 0 ? (
          <p className="text-center text-white/30 text-sm py-12">No services listed yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/booking"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg border border-white/10 text-sm font-semibold text-white/70 hover:text-white hover:border-white/20 hover:bg-white/4 transition-all duration-200 group"
          >
            Book an Appointment
            <ArrowRight
              size={15}
              strokeWidth={2.5}
              className="group-hover:translate-x-1 transition-transform duration-200"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}

function ServiceCard({ service }: { service: DBService }) {
  const badge = getBadge(service.name)
  return (
    <Link href={`/booking?service=${service.id}`} className="group block">
      <div className="h-full flex flex-col gap-4 p-6 rounded-2xl bg-charcoal-800/70 border border-white/5 hover:border-gold-500/30 hover:bg-charcoal-800 transition-all duration-300 hover:shadow-[0_0_0_1px_rgba(201,168,76,0.12),0_24px_48px_-12px_rgba(0,0,0,0.6),0_8px_32px_-8px_rgba(201,168,76,0.08)] hover:-translate-y-1">

        {/* Icon + price row — badge never overlaps price */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-11 h-11 rounded-xl bg-gold-500/8 border border-gold-500/15 flex items-center justify-center group-hover:bg-gold-500/15 group-hover:border-gold-500/30 transition-all duration-300 flex-shrink-0">
            <Scissors size={18} className="text-gold-500 rotate-[-45deg]" strokeWidth={2} />
          </div>
          <span className="text-2xl font-bold text-white group-hover:text-gold-300 transition-colors duration-200 leading-none pt-1">
            ${service.price}
          </span>
        </div>

        {/* Name + badge + duration */}
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <h3 className="text-base font-semibold text-white group-hover:text-gold-100 transition-colors duration-200">
              {service.name}
            </h3>
            {badge && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-gold-500/12 text-gold-400 border border-gold-500/20 flex-shrink-0">
                <Zap size={8} className="fill-gold-400" />
                {badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-white/30">
            <Clock size={11} strokeWidth={2} />
            <span className="text-xs">{formatDuration(service.duration)}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-white/40 leading-relaxed flex-1">
          {service.description}
        </p>

        {/* Book CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
          <span className="text-xs font-semibold text-gold-500/60 group-hover:text-gold-400 transition-colors duration-200 flex items-center gap-1.5">
            Book This Service
            <ArrowRight size={11} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </span>
          <div className="w-6 h-6 rounded-full bg-gold-500/0 group-hover:bg-gold-500/10 border border-gold-500/0 group-hover:border-gold-500/20 flex items-center justify-center transition-all duration-300">
            <ArrowRight size={10} className="text-gold-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </div>
      </div>
    </Link>
  )
}
