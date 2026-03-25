import Link from 'next/link'
import { CheckCircle2, ArrowRight, Scissors } from 'lucide-react'

const highlights = [
  'Master Barbers with 10+ years experience',
  'Premium Grooming Products',
  'Walk-ins Welcome',
  'Online Booking Available',
]

export default function AboutSection() {
  return (
    <section className="py-24 bg-[#0D0D0D] relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: text content */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold-500 mb-3">
                Our Story
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
              Established in 2018, Aryan Blendz is more than a barbershop — it's a destination
              for men who care about their appearance. Our skilled barbers combine classic
              techniques with modern style to deliver cuts that turn heads.
            </p>

            <p className="text-sm sm:text-base text-white/45 leading-relaxed">
              Every client who sits in our chair receives undivided attention and a
              personalized experience. We don't just cut hair — we craft confidence.
            </p>

            {/* Highlights */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
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
            <div className="mt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-md text-sm font-semibold tracking-wide border border-gold-500/30 text-gold-400 hover:text-charcoal-950 hover:bg-gold-500 hover:border-gold-500 transition-all duration-200 group"
              >
                Meet Our Team
                <ArrowRight
                  size={15}
                  strokeWidth={2.5}
                  className="group-hover:translate-x-0.5 transition-transform duration-200"
                />
              </Link>
            </div>
          </div>

          {/* Right: decorative element */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-sm">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-2xl bg-gold-500/5 blur-3xl scale-110" />

              {/* Main decorative card */}
              <div className="relative rounded-2xl border border-gold-500/15 bg-charcoal-800/60 backdrop-blur-sm overflow-hidden p-8 flex flex-col items-center gap-6">
                {/* Large scissor icon */}
                <div className="w-20 h-20 rounded-full bg-gold-500/8 border-2 border-gold-500/20 flex items-center justify-center">
                  <Scissors
                    size={36}
                    className="text-gold-400 rotate-[-45deg]"
                    strokeWidth={1.5}
                  />
                </div>

                {/* Brand text */}
                <div className="text-center">
                  <p
                    className="text-2xl font-bold text-white mb-1"
                    style={{
                      fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                    }}
                  >
                    Aryan Blendz
                  </p>
                  <p className="text-xs tracking-[0.2em] uppercase text-gold-500/70">
                    Est. 2018
                  </p>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gold-500/25 to-transparent" />

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 w-full text-center">
                  {[
                    { value: '500+', label: 'Clients' },
                    { value: '6+', label: 'Years' },
                    { value: '5★', label: 'Rating' },
                  ].map(({ value, label }) => (
                    <div key={label}>
                      <p className="text-lg font-bold text-gold-400">{value}</p>
                      <p className="text-[10px] text-white/35 uppercase tracking-wider mt-0.5">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Tagline */}
                <p className="text-xs text-white/30 italic text-center">
                  "Where precision meets style."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
