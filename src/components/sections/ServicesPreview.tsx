import Link from 'next/link'
import { Clock, ArrowRight, Scissors, Zap } from 'lucide-react'

interface Service {
  name: string
  duration: string
  price: number
  description: string
  badge?: string
}

const services: Service[] = [
  {
    name: 'Haircut',
    duration: '45 min',
    price: 35,
    description:
      'A precision cut tailored to your head shape and personal style. Includes wash and style finish.',
  },
  {
    name: 'Beard Trim',
    duration: '30 min',
    price: 25,
    description:
      'Expert shaping and detailing to keep your beard looking sharp, defined, and well-groomed.',
  },
  {
    name: 'Lineup / Edge Up',
    duration: '20 min',
    price: 20,
    description:
      'Crisp edge-up on your hairline, temples, and neckline. Clean lines, instant refresh.',
  },
  {
    name: 'Haircut + Beard',
    duration: '70 min',
    price: 55,
    description:
      'The complete look — precision haircut combined with expert beard sculpting and detailing.',
    badge: 'Most Popular',
  },
  {
    name: "Kids Cut",
    duration: '30 min',
    price: 25,
    description:
      "Gentle, expert cuts for boys under 12. Clean results they'll be proud to show off.",
  },
  {
    name: 'Premium Package',
    duration: '90 min',
    price: 75,
    description:
      'The full experience — haircut, hot towel shave, beard trim, and a scalp massage. Pure luxury.',
    badge: 'Best Value',
  },
]

export default function ServicesPreview() {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <ServiceCard key={service.name} service={service} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg border border-white/10 text-sm font-semibold text-white/70 hover:text-white hover:border-white/20 hover:bg-white/4 transition-all duration-200 group"
          >
            View Full Services Menu
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

function ServiceCard({ service }: { service: Service }) {
  return (
    <Link href="/booking" className="group block relative">
      <div className="relative h-full flex flex-col gap-4 p-6 rounded-2xl bg-charcoal-800/70 border border-white/5 hover:border-gold-500/30 hover:bg-charcoal-800 transition-all duration-300 hover:shadow-[0_0_0_1px_rgba(201,168,76,0.12),0_24px_48px_-12px_rgba(0,0,0,0.6),0_8px_32px_-8px_rgba(201,168,76,0.08)] hover:-translate-y-1">

        {service.badge && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-gold-500/12 text-gold-400 border border-gold-500/20">
              <Zap size={8} className="fill-gold-400" />
              {service.badge}
            </span>
          </div>
        )}

        {/* Icon + price */}
        <div className="flex items-start justify-between">
          <div className="w-11 h-11 rounded-xl bg-gold-500/8 border border-gold-500/15 flex items-center justify-center group-hover:bg-gold-500/15 group-hover:border-gold-500/30 transition-all duration-300">
            <Scissors
              size={18}
              className="text-gold-500 rotate-[-45deg]"
              strokeWidth={2}
            />
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-white group-hover:text-gold-300 transition-colors duration-200">
              ${service.price}
            </span>
          </div>
        </div>

        {/* Name + duration */}
        <div>
          <h3 className="text-base font-semibold text-white group-hover:text-gold-100 transition-colors duration-200 mb-1.5">
            {service.name}
          </h3>
          <div className="flex items-center gap-1.5 text-white/30">
            <Clock size={11} strokeWidth={2} />
            <span className="text-xs">{service.duration}</span>
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
            <ArrowRight
              size={11}
              strokeWidth={2.5}
              className="group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </span>
          <div className="w-6 h-6 rounded-full bg-gold-500/0 group-hover:bg-gold-500/10 border border-gold-500/0 group-hover:border-gold-500/20 flex items-center justify-center transition-all duration-300">
            <ArrowRight size={10} className="text-gold-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </div>
      </div>
    </Link>
  )
}
