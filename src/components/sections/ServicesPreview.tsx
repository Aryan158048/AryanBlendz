import Link from 'next/link'
import { Clock, ArrowRight, Scissors } from 'lucide-react'

interface Service {
  name: string
  duration: string
  price: number
  description: string
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
    name: 'Lineup',
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
  },
]

export default function ServicesPreview() {
  return (
    <section className="py-24 bg-charcoal-950 relative">
      {/* Top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold-500 mb-3">
            What We Offer
          </p>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif' }}
          >
            Our Services
          </h2>
          {/* Gold underline accent */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <span className="h-px w-12 bg-gold-500/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
            <span className="h-px w-12 bg-gold-500/40" />
          </div>
          <p className="mt-5 text-white/50 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            From a clean lineup to the full premium package — every service is delivered with precision and care.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <ServiceCard key={service.name} service={service} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold-400 hover:text-gold-300 transition-colors duration-200 group"
          >
            View All Services
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
    <div className="group relative flex flex-col gap-4 p-6 rounded-xl bg-charcoal-800 border border-white/5 hover:border-gold-500/25 hover:shadow-[0_0_0_1px_rgba(201,168,76,0.15),0_8px_40px_-8px_rgba(201,168,76,0.12)] transition-all duration-300">
      {/* Icon */}
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-lg bg-gold-500/8 border border-gold-500/15 flex items-center justify-center group-hover:bg-gold-500/15 group-hover:border-gold-500/30 transition-all duration-200">
          <Scissors
            size={16}
            className="text-gold-500 rotate-[-45deg]"
            strokeWidth={2}
          />
        </div>
        <span className="text-xl font-bold text-gold-400 tracking-tight">
          ${service.price}
        </span>
      </div>

      {/* Service name + duration */}
      <div>
        <h3 className="text-base font-semibold text-white mb-1 group-hover:text-gold-100 transition-colors duration-200">
          {service.name}
        </h3>
        <div className="flex items-center gap-1.5 text-white/35">
          <Clock size={12} strokeWidth={2} />
          <span className="text-xs">{service.duration}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-white/45 leading-relaxed flex-1">
        {service.description}
      </p>

      {/* Book link */}
      <Link
        href="/booking"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-500/70 hover:text-gold-400 transition-colors duration-200 group/link mt-auto pt-2 border-t border-white/5"
      >
        Book Now
        <ArrowRight
          size={12}
          strokeWidth={2.5}
          className="group-hover/link:translate-x-0.5 transition-transform duration-200"
        />
      </Link>
    </div>
  )
}
