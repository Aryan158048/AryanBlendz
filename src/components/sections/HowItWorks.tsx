import { CalendarCheck, Clock3, Sparkles } from 'lucide-react'

interface Step {
  number: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  title: string
  description: string
}

const steps: Step[] = [
  {
    number: '01',
    icon: CalendarCheck,
    title: 'Choose Your Service',
    description:
      'Browse our menu of premium services — from a clean lineup to the full luxury package. Pick what suits you.',
  },
  {
    number: '02',
    icon: Clock3,
    title: 'Pick a Time',
    description:
      'Select a date and time that works for you. Real-time availability, instant confirmation, zero waiting.',
  },
  {
    number: '03',
    icon: Sparkles,
    title: 'Show Up & Get Fresh',
    description:
      'Show up, sit down, and let Aryan handle the rest. Walk out with a clean cut you\'ll actually love.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-24 bg-[#0D0D0D] relative">
      {/* Top + bottom border gradients */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold-500 mb-3">
            Simple Process
          </p>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
            style={{ fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif' }}
          >
            How It Works
          </h2>
          <div className="flex items-center justify-center gap-2 mt-5">
            <span className="h-px w-12 bg-gold-500/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
            <span className="h-px w-12 bg-gold-500/40" />
          </div>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {/* Connecting line (desktop) */}
          <div
            className="hidden md:block absolute top-[2.75rem] left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-px"
            style={{
              background:
                'linear-gradient(90deg, rgba(201,168,76,0.3) 0%, rgba(201,168,76,0.5) 50%, rgba(201,168,76,0.3) 100%)',
            }}
          />

          {steps.map(({ number, icon: Icon, title, description }, index) => (
            <div key={number} className="relative flex flex-col items-center text-center gap-5">
              {/* Step number circle */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-full border-2 border-gold-500/40 bg-charcoal-950 flex items-center justify-center group-hover:border-gold-500 transition-colors duration-300">
                  <Icon
                    size={22}
                    strokeWidth={1.75}
                    className="text-gold-400"
                  />
                </div>
                {/* Number badge */}
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center text-[9px] font-bold text-charcoal-950 tracking-wide">
                  {index + 1}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-semibold tracking-[0.2em] text-gold-500/60 uppercase">
                  Step {number}
                </span>
                <h3 className="text-lg font-semibold text-white">
                  {title}
                </h3>
                <p className="text-sm text-white/45 leading-relaxed max-w-xs mx-auto">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
