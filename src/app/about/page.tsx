import Link from 'next/link'
import { Star, Share2, Award, Heart, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getBarberProfile } from '@/app/actions/booking'

export const metadata = {
  title: 'About | Aryan Blendz',
  description:
    'Learn about Aryan Blendz — our story, our team, and our commitment to premium barbering.',
}

export default async function AboutPage() {
  const barber = await getBarberProfile()

  const values = [
    {
      icon: Zap,
      title: 'Precision',
      description:
        'Every cut is executed with surgical precision. We obsess over the details — clean lines, seamless fades, and perfect symmetry — because that\'s what separates good from great.',
    },
    {
      icon: Heart,
      title: 'Trust',
      description:
        'You\'re putting your look in our hands. We take that seriously. Our barbers listen first, advise second, and always deliver on what they promise.',
    },
    {
      icon: Award,
      title: 'Premium Experience',
      description:
        'From the moment you book to the moment you walk out, every touchpoint is designed to feel elevated. No waiting around. No compromises. Just a world-class experience.',
    },
  ]

  const initials = barber.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <main className="min-h-screen bg-charcoal-950">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gold-500/6 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 animate-fade-in">
          <Badge className="mb-6 bg-gold-500/10 text-gold-400 border border-gold-500/20 px-4 py-1.5 text-sm">
            Piscataway, NJ · Rutgers Area
          </Badge>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            My{' '}
            <span className="text-gradient-gold">Story</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Built on a passion for craft, a respect for culture, and an obsession
            with making every client look and feel their absolute best.
          </p>
        </div>
      </section>

      {/* Story section */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center animate-slide-up">
          <div className="space-y-5">
            <h2 className="font-display text-3xl font-bold text-white">
              Where It All Began
            </h2>
            <p className="text-white/60 leading-relaxed">
              It started in my dorm room at Rutgers. I picked up clippers, started
              cutting my friends, and realized I actually had a gift for it. Word
              spread fast — because when you&apos;re a broke college student who wants
              a clean cut without leaving campus, finding someone who can actually
              deliver is a big deal.
            </p>
            <p className="text-white/60 leading-relaxed">
              What started as dorm-room cuts turned into Aryan Blendz — a real brand
              built for students who want a premium haircut without the premium hassle.
              I now cut out of Judson Suites in Piscataway, right near Rutgers. Private
              setup, no waiting, no walk-in stress. Just you and a barber who genuinely
              cares about how you leave looking.
            </p>
            <p className="text-white/60 leading-relaxed">
              100+ clients in and the mission hasn&apos;t changed: show up on time,
              know your craft, and make sure every person walks out sharper than they
              came in. That&apos;s the Aryan Blendz standard.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden gold-border">
              <div className="w-full h-full bg-gradient-to-br from-charcoal-800 via-charcoal-900 to-charcoal-950 flex items-center justify-center">
                <div className="text-center px-8">
                  <div className="text-8xl font-display font-bold text-gradient-gold mb-2">
                    {barber.yearsExperience}+
                  </div>
                  <div className="text-white/50 text-lg">Years of Excellence</div>
                  <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-gold-400">
                        {barber.totalCustomers > 0 ? `${barber.totalCustomers}+` : '100+'}
                      </div>
                      <div className="text-white/30 text-xs mt-1">Happy Clients</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gold-400">{barber.rating}</div>
                      <div className="text-white/30 text-xs mt-1">Avg Rating</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gold-400">1</div>
                      <div className="text-white/30 text-xs mt-1">Dedicated Barber</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gold-400">6</div>
                      <div className="text-white/30 text-xs mt-1">Services</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-[var(--shadow-gold-lg)]">
              <div className="text-center">
                <div className="text-charcoal-950 font-bold text-lg leading-none">{barber.rating}</div>
                <Star className="w-4 h-4 text-charcoal-950 fill-charcoal-950 mx-auto mt-0.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Your Barber */}
      <section className="py-20 bg-charcoal-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-white mb-3">
              Meet Your{' '}
              <span className="text-gradient-gold">Barber</span>
            </h2>
          </div>

          <div className="max-w-sm mx-auto">
            <div className="glass gold-border rounded-2xl overflow-hidden hover:border-gold-400/40 transition-colors">
              <div className="aspect-square relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-charcoal-800 via-charcoal-900 to-charcoal-950">
                <div className="w-28 h-28 rounded-full bg-gradient-gold flex items-center justify-center shadow-[var(--shadow-gold)]">
                  <span className="font-display text-4xl font-bold text-charcoal-950">
                    {initials}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3">
                  <div className="flex items-center gap-1 bg-charcoal-950/80 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
                    <span className="text-white text-xs font-medium">{barber.rating}</span>
                    <span className="text-white/40 text-xs">({barber.totalReviews})</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">
                      {barber.name}
                    </h3>
                    <p className="text-gold-400/70 text-xs">
                      {barber.yearsExperience} yrs experience
                    </p>
                  </div>
                  {barber.instagram && (
                    <a
                      href={`https://instagram.com/${barber.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/30 hover:text-gold-400 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-white/40 text-xs leading-relaxed mb-3">
                  {barber.bio}
                </p>
                <div className="flex flex-wrap gap-1">
                  {(barber.specialties as string[]).slice(0, 2).map((s) => (
                    <Badge
                      key={s}
                      className="text-[10px] px-2 py-0.5 bg-gold-500/8 text-gold-400/80 border-gold-500/20"
                    >
                      {s}
                    </Badge>
                  ))}
                  {(barber.specialties as string[]).length > 2 && (
                    <Badge className="text-[10px] px-2 py-0.5 bg-white/5 text-white/30 border-white/8">
                      +{(barber.specialties as string[]).length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-white mb-3">
            Our{' '}
            <span className="text-gradient-gold">Values</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            These aren&apos;t just words on a wall. They&apos;re the principles that
            guide every cut, every conversation, every appointment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((value) => {
            const Icon = value.icon
            return (
              <div
                key={value.title}
                className="glass gold-border rounded-2xl p-6 hover:border-gold-400/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center mb-4 shadow-[var(--shadow-gold)]">
                  <Icon className="w-6 h-6 text-charcoal-950" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass gold-border rounded-3xl p-10">
            <h2 className="font-display text-4xl font-bold text-white mb-3">
              Ready for a premium cut?
            </h2>
            <p className="text-white/50 mb-8 text-lg">
              Book your appointment online in seconds. No waiting. No hassle.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link href="/booking">Book Now</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
