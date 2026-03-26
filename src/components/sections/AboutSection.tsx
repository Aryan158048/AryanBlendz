import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, ArrowRight, Scissors, Star, Award, Users } from 'lucide-react'

const highlights = [
  '8+ Years of Hands-On Experience',
  'Precision Fades & Clean Lineups',
  'Premium Grooming Products Only',
  'Same-Day Booking Available',
]

const achievements = [
  { icon: Star, value: '4.9', label: 'Avg Rating' },
  { icon: Users, value: '500+', label: 'Clients Served' },
  { icon: Award, value: '8 Yrs', label: 'Experience' },
]

export default function AboutSection() {
  return (
    <section className="py-24 bg-[#0D0D0D] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* Decorative glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-gold-500/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: Photo */}
          <div className="order-2 lg:order-1 flex items-center justify-center">
            <div className="relative w-full max-w-sm">
              {/* Outer glow */}
              <div className="absolute -inset-6 rounded-3xl bg-gold-500/4 blur-2xl" />

              {/* Photo card */}
              <div className="relative rounded-2xl overflow-hidden border border-gold-500/15 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.7)]">
                <div className="aspect-[4/5] bg-charcoal-800 relative">
                  <Image
                    src="/images/aryan.jpg"
                    alt="Aryan — Barber"
                    fill
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-charcoal-800 to-charcoal-900 opacity-0">
                    <div className="w-20 h-20 rounded-full bg-gold-500/10 border-2 border-gold-500/20 flex items-center justify-center">
                      <Scissors className="w-9 h-9 text-gold-400 rotate-[-45deg]" strokeWidth={1.5} />
                    </div>
                    <p className="text-white/30 text-sm text-center px-4">Drop your photo at<br/><span className="text-white/50 font-mono text-xs">public/images/aryan.jpg</span></p>
                  </div>
                  {/* Gradient overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-charcoal-950/90 to-transparent" />
                  {/* Name label */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="font-display text-xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif' }}>Aryan</p>
                    <p className="text-gold-400 text-xs font-medium tracking-wide mt-0.5">Barber · @aryanblendz</p>
                  </div>
                </div>
              </div>

              {/* Achievement badges */}
              <div className="absolute -right-4 top-8 flex flex-col gap-2">
                {achievements.map(({ icon: Icon, value, label }) => (
                  <div key={label} className="flex items-center gap-2 bg-charcoal-900/95 border border-gold-500/20 rounded-xl px-3 py-2 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.6)] backdrop-blur-sm">
                    <Icon className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                    <div>
                      <p className="text-white text-xs font-bold leading-none">{value}</p>
                      <p className="text-white/35 text-[9px] leading-none mt-0.5">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Text content */}
          <div className="order-1 lg:order-2 flex flex-col gap-7">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold-500 mb-3">
                My Story
              </p>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight"
                style={{ fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif' }}
              >
                The Aryan Blendz{' '}
                <span className="text-gradient-gold">Experience</span>
              </h2>
            </div>

            <div className="h-px w-16 bg-gold-500/40" />

            <p className="text-sm sm:text-base text-white/55 leading-relaxed">
              I've been cutting hair for 8+ years and built Aryan Blendz around one simple
              idea — every client deserves a clean, precise cut with real attention to detail.
              No crowded waiting rooms, no rushing. Just you, the chair, and a barber who
              actually cares.
            </p>

            <p className="text-sm sm:text-base text-white/45 leading-relaxed">
              I cut out of Judson Suites in Piscataway, right near Rutgers. Whether you want
              a fresh fade, a sharp lineup, or a full cut and beard — book a slot and I'll
              make sure you leave looking right.
            </p>

            {/* Highlights */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    size={16}
                    className="text-gold-500 flex-shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <span className="text-sm text-white/65 leading-snug">{item}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="flex items-center gap-4 pt-2">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-md text-sm font-semibold tracking-wide text-charcoal-950 bg-gold-500 hover:bg-gold-400 transition-all duration-200 shadow-[0_4px_24px_-4px_rgba(201,168,76,0.35)] hover:-translate-y-0.5 group"
              >
                Book a Session
                <ArrowRight size={15} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
              <Link
                href="/about"
                className="text-sm text-gold-400/70 hover:text-gold-400 transition-colors duration-200 font-medium"
              >
                Learn more →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
