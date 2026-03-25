import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-charcoal-950" />

      {/* Radial gradient spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(201,168,76,0.08),transparent_70%)]" />

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Diagonal stripe texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, #C9A84C 0px, #C9A84C 1px, transparent 0px, transparent 50%)',
          backgroundSize: '12px 12px',
        }}
      />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-charcoal-950 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Eyebrow label */}
        <div className="inline-flex items-center gap-2.5 mb-8">
          <span className="h-px w-8 bg-gold-500/60" />
          <span className="text-xs font-semibold tracking-[0.25em] uppercase text-gold-500">
            Premium Barbershop
          </span>
          <span className="h-px w-8 bg-gold-500/60" />
        </div>

        {/* Main headline */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-[-0.03em] mb-6"
          style={{ fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif' }}
        >
          <span className="block text-white">Where Precision</span>
          <span className="block text-gradient-gold mt-1">Meets Style.</span>
        </h1>

        {/* Subtext */}
        <p className="text-base sm:text-lg text-white/55 max-w-xl leading-relaxed mb-10">
          Premium grooming services in the heart of the city.{' '}
          <span className="text-white/75">Book your appointment in seconds.</span>
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/booking"
            className="inline-flex items-center gap-2.5 px-7 py-4 rounded-md text-sm font-semibold tracking-wide text-charcoal-950 bg-gold-500 hover:bg-gold-400 active:bg-gold-600 transition-all duration-200 shadow-[0_8px_40px_-8px_rgba(201,168,76,0.45)] hover:shadow-[0_12px_48px_-8px_rgba(201,168,76,0.6)] hover:-translate-y-0.5 group"
          >
            Book Appointment
            <ArrowRight
              size={16}
              strokeWidth={2.5}
              className="group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </Link>

          <Link
            href="/services"
            className="inline-flex items-center gap-2.5 px-7 py-4 rounded-md text-sm font-semibold tracking-wide text-white/80 border border-white/15 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            View Services
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-16 flex flex-col sm:flex-row items-center gap-6 sm:gap-0">
          {[
            { value: '500+', label: 'Happy Clients' },
            { value: '5★', label: 'Rating' },
            { value: 'Est. 2018', label: 'Trusted Since' },
          ].map(({ value, label }, i) => (
            <div key={label} className="flex items-center gap-6 sm:gap-0">
              <div className="flex flex-col items-center sm:px-8">
                <span className="text-xl font-bold text-gold-400 tracking-tight">
                  {value}
                </span>
                <span className="text-xs text-white/35 tracking-[0.12em] uppercase mt-0.5">
                  {label}
                </span>
              </div>
              {i < 2 && (
                <span className="hidden sm:block h-8 w-px bg-white/10" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-10 animate-bounce opacity-40">
        <ChevronDown size={18} className="text-white/60" strokeWidth={1.5} />
      </div>
    </section>
  )
}
