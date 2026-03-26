import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, Scissors } from 'lucide-react'
import { getBarberProfile } from '@/app/actions/booking'

export default async function Hero() {
  const profile = await getBarberProfile().catch(() => ({
    rating: 4.9, totalReviews: 0, yearsExperience: 8, totalCustomers: 0,
  }))

  return (
    <section className="relative bg-charcoal-950 overflow-hidden">

      {/* ─────────────────────────────────────────────
          MOBILE LAYOUT  (< lg)
          Photo fills top, content stacks below
      ───────────────────────────────────────────── */}
      <div className="lg:hidden">
        {/* Photo — full width, portrait crop */}
        <div className="relative w-full" style={{ aspectRatio: '4/5' }}>
          <Image
            src="/images/aryan.jpg"
            alt="Aryan — Barber"
            fill
            sizes="100vw"
            className="object-cover object-top"
            priority
          />
          {/* Bottom gradient so text is readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/20 to-transparent" />

          {/* Name overlay at bottom of photo */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-gold-400 text-xs font-semibold tracking-[0.2em] uppercase mb-1">
                  Premium Cuts · Piscataway, NJ
                </p>
                <h1
                  className="text-4xl font-bold text-white leading-[1.05] tracking-tight"
                  style={{ fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif' }}
                >
                  Aryan
                  <span className="block text-gradient-gold text-3xl mt-0.5">Blendz</span>
                </h1>
              </div>
              {/* Rating pill */}
              <div className="flex items-center gap-1.5 bg-charcoal-900/80 backdrop-blur-sm border border-gold-500/20 rounded-xl px-3 py-2">
                <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                <span className="text-white text-sm font-bold">{profile.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content below photo */}
        <div className="px-5 pt-5 pb-8 space-y-5">
          {/* Tagline */}
          <p className="text-white/60 text-base leading-relaxed">
            Sharp cuts and clean fades —{' '}
            <span className="text-white/90 font-medium">one barber, complete focus, flawless results.</span>
          </p>

          {/* Book button */}
          <Link
            href="/booking"
            className="flex items-center justify-center gap-2.5 w-full py-4 rounded-xl text-base font-bold tracking-wide text-charcoal-950 bg-gold-500 active:bg-gold-600 transition-colors shadow-[0_8px_32px_-8px_rgba(201,168,76,0.5)]"
          >
            Book Appointment
            <ArrowRight size={18} strokeWidth={2.5} />
          </Link>

          {/* Stats row */}
          <div className="flex items-center gap-0 border border-white/8 rounded-xl overflow-hidden">
            {[
              { value: profile.totalCustomers > 0 ? `${profile.totalCustomers}+` : '500+', label: 'Clients' },
              { value: `${profile.rating}★`, label: 'Rating' },
              { value: `${profile.yearsExperience} Yrs`, label: 'Experience' },
            ].map(({ value, label }, i) => (
              <div key={label} className={`flex-1 py-3.5 text-center ${i < 2 ? 'border-r border-white/8' : ''}`}>
                <div className="text-lg font-bold text-gold-400 leading-none">{value}</div>
                <div className="text-[11px] text-white/35 uppercase tracking-wide mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Instagram link */}
          <a
            href="https://www.instagram.com/aryanblendz/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium text-white/50 border border-white/10 active:bg-white/5 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            @aryanblendz
          </a>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          DESKTOP LAYOUT  (lg+)
          Side-by-side: text left, photo right
      ───────────────────────────────────────────── */}
      <div className="hidden lg:block">
        {/* Background accents */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_60%_-10%,rgba(201,168,76,0.10),transparent_65%)]" />
        <div className="absolute top-0 right-0 w-[60%] h-full bg-[radial-gradient(ellipse_60%_80%_at_100%_40%,rgba(201,168,76,0.04),transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-charcoal-950 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16">
          <div className="grid grid-cols-2 gap-16 items-center min-h-[85vh]">
            {/* Left: Text */}
            <div className="flex flex-col gap-8">
              <div className="inline-flex items-center gap-2.5 w-fit">
                <span className="h-px w-8 bg-gold-500/60" />
                <span className="text-xs font-semibold tracking-[0.25em] uppercase text-gold-500">
                  Premium Cuts · Piscataway, NJ
                </span>
              </div>

              <h1
                className="text-6xl xl:text-7xl font-bold leading-[1.04] tracking-[-0.03em]"
                style={{ fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif' }}
              >
                <span className="block text-white">Where Precision</span>
                <span className="block text-gradient-gold mt-1">Meets Style.</span>
              </h1>

              <p className="text-lg text-white/50 max-w-lg leading-relaxed">
                Sharp cuts and clean fades by{' '}
                <span className="text-gold-400 font-medium">Aryan</span>
                {' '}— one barber, complete focus, flawless results.{' '}
                <span className="text-white/70 font-medium">Book your slot in seconds.</span>
              </p>

              <div className="flex items-center gap-4">
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-md text-sm font-semibold tracking-wide text-charcoal-950 bg-gold-500 hover:bg-gold-400 active:bg-gold-600 transition-all duration-200 shadow-[0_8px_40px_-8px_rgba(201,168,76,0.5)] hover:shadow-[0_12px_48px_-8px_rgba(201,168,76,0.65)] hover:-translate-y-0.5 group"
                >
                  Book Appointment
                  <ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a
                  href="https://www.instagram.com/aryanblendz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-4 rounded-md text-sm font-semibold tracking-wide text-white/65 border border-white/10 hover:border-white/20 hover:text-white hover:bg-white/4 transition-all duration-200"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                  @aryanblendz
                </a>
              </div>

              <div className="flex items-center gap-8 pt-4 border-t border-white/6">
                {[
                  { value: profile.totalCustomers > 0 ? `${profile.totalCustomers}+` : '500+', label: 'Happy Clients' },
                  { value: `${profile.rating}★`, label: 'Avg Rating' },
                  { value: `${profile.yearsExperience} Yrs`, label: 'Experience' },
                ].map(({ value, label }) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-xl font-bold text-gold-400 tracking-tight leading-none">{value}</span>
                    <span className="text-[11px] text-white/35 tracking-[0.12em] uppercase mt-1">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Portrait */}
            <div className="flex items-center justify-end">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-8 rounded-3xl bg-gold-500/6 blur-3xl" />
                <div className="relative rounded-2xl overflow-hidden border border-gold-500/20 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.8),0_0_0_1px_rgba(201,168,76,0.1)]">
                  <div className="relative aspect-[3/4] bg-charcoal-800">
                    <Image
                      src="/images/aryan.jpg"
                      alt="Aryan — Barber"
                      fill
                      sizes="448px"
                      className="object-cover object-top"
                      priority
                    />
                    {/* Fallback if no photo */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-charcoal-800 to-charcoal-900 opacity-0">
                      <Scissors className="w-10 h-10 text-gold-400 rotate-[-45deg]" strokeWidth={1.5} />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-charcoal-950/95 via-charcoal-950/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="font-display text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif' }}>
                        Aryan
                      </div>
                      <p className="text-gold-400 text-sm font-medium mt-0.5">Barber · @aryanblendz</p>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-4 -left-4 flex items-center gap-2 bg-charcoal-900 border border-gold-500/25 rounded-xl px-3.5 py-2.5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)]">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-gold-400 text-gold-400" />
                    ))}
                  </div>
                  <span className="text-white text-xs font-semibold">{profile.rating}</span>
                  {profile.totalReviews > 0 && <span className="text-white/40 text-xs">· {profile.totalReviews} reviews</span>}
                </div>
                <div className="absolute -bottom-4 -right-4 flex items-center gap-2 bg-charcoal-900 border border-emerald-500/20 rounded-xl px-3.5 py-2.5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  <span className="text-emerald-400 text-xs font-semibold">Taking Bookings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
