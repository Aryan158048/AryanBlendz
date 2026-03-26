import Link from 'next/link'
import { CheckCircle2, ArrowRight, Star, Award, Users, Quote } from 'lucide-react'
import { getBarberProfile } from '@/app/actions/booking'

const highlights = [
  'Precision Fades & Clean Lineups',
  'Premium Grooming Products Only',
  'Same-Day Booking Available',
  'One Barber, Full Focus on You',
]

const testimonials = [
  {
    quote:
      "The fade is so clean it looks Photoshopped. He doesn't just give cuts, he gives life upgrades — confidence comes after every appointment.",
    name: '@kachau23_',
  },
  {
    quote:
      "He doesn't just cut hair, he sculpts it. I always walk out feeling sharper and more confident.",
    name: '@kachau23_',
  },
  {
    quote: 'Got me right.',
    name: '@anirudh.con',
  },
]

export default async function AboutSection() {
  const profile = await getBarberProfile().catch(() => ({
    rating: 4.9, totalCustomers: 0, yearsExperience: 3,
  }))

  const achievements = [
    { icon: Star,  value: String(profile.rating),                                                  label: 'Avg Rating' },
    { icon: Users, value: profile.totalCustomers > 0 ? `${profile.totalCustomers}+` : '100+',     label: 'Clients Served' },
    { icon: Award, value: `${profile.yearsExperience} Yrs`,                                        label: 'Experience' },
  ]

  return (
    <section className="py-24 bg-[#0D0D0D] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-gold-500/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: Testimonials + stats */}
          <div className="order-2 lg:order-1 flex flex-col gap-4">

            {/* Stats row */}
            <div className="flex items-center gap-3 mb-1">
              {achievements.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex-1 flex items-center gap-2 bg-charcoal-900/80 border border-gold-500/15 rounded-xl px-3 py-2.5">
                  <Icon className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-bold leading-none">{value}</p>
                    <p className="text-white/35 text-[10px] leading-none mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial cards */}
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="group relative flex flex-col gap-3 p-5 rounded-xl bg-charcoal-900/60 border border-white/6 hover:border-gold-500/20 hover:bg-charcoal-900/80 transition-all duration-300"
              >
                <Quote
                  size={22}
                  className="text-gold-500/25 -scale-x-100 -mt-0.5 flex-shrink-0"
                  strokeWidth={1.5}
                />
                <p className="text-sm text-white/65 leading-relaxed italic flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-white/6">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-700 to-gold-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-charcoal-950">
                        {t.name.replace('@', '').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-white/40 font-medium">{t.name}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={10} strokeWidth={0} className="fill-gold-400 text-gold-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <p className="text-xs text-white/25 text-center pt-1">Real reviews from Instagram</p>
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
              Started cutting in my dorm at Rutgers and built Aryan Blendz from the ground up —
              one cut at a time. My mission is simple: give students a premium haircut without
              the premium hassle. No crowded shop, no long waits, no compromises.
            </p>

            <p className="text-sm sm:text-base text-white/45 leading-relaxed">
              I cut out of Judson Suites in Piscataway, right near campus. Whether you want
              a fresh fade, a sharp lineup, or a full cut and beard — book a slot and I&apos;ll
              make sure you leave looking right.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-gold-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm text-white/65 leading-snug">{item}</span>
                </li>
              ))}
            </ul>

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
