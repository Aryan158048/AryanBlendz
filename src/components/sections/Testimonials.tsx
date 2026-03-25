import { Star, Quote } from 'lucide-react'

interface Testimonial {
  quote: string
  name: string
  role: string
  rating: number
}

const testimonials: Testimonial[] = [
  {
    quote:
      'Best barber in the city. The attention to detail is unmatched. Every visit is an experience I look forward to.',
    name: 'Marcus T.',
    role: 'Regular Client',
    rating: 5,
  },
  {
    quote:
      "Booking was effortless and the cut was perfect. Exactly what I wanted — I'll be back every time.",
    name: 'James K.',
    role: 'New Client',
    rating: 5,
  },
  {
    quote:
      "I've been coming here for 2 years. Never leaving. The vibe, the skill, the consistency — it's unreal.",
    name: 'Devon R.',
    role: 'Loyal Customer',
    rating: 5,
  },
  {
    quote:
      'The premium package is worth every penny. Top-tier grooming experience from start to finish.',
    name: 'Alex M.',
    role: 'Premium Client',
    rating: 5,
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          strokeWidth={0}
          className={i < rating ? 'fill-gold-400 text-gold-400' : 'fill-white/15 text-white/15'}
        />
      ))}
    </div>
  )
}

export default function Testimonials() {
  return (
    <section className="py-24 bg-charcoal-950 relative">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(201,168,76,0.04),transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold-500 mb-3">
            Client Stories
          </p>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif' }}
          >
            What Our Clients Say
          </h2>
          <div className="flex items-center justify-center gap-2 mt-5">
            <span className="h-px w-12 bg-gold-500/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
            <span className="h-px w-12 bg-gold-500/40" />
          </div>
        </div>

        {/* Cards grid — 2x2 on md, 4-col on xl or 2-col wrapping */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const { quote, name, role, rating } = testimonial
  return (
    <div className="group relative flex flex-col gap-5 p-6 sm:p-7 rounded-xl glass border border-white/6 hover:border-gold-500/20 hover:shadow-[0_0_0_1px_rgba(201,168,76,0.1),0_8px_40px_-8px_rgba(201,168,76,0.08)] transition-all duration-300">
      {/* Quote icon */}
      <div className="flex items-start justify-between">
        <Quote
          size={28}
          className="text-gold-500/20 group-hover:text-gold-500/30 transition-colors duration-200 -scale-x-100 -mt-1"
          strokeWidth={1.5}
        />
        <StarRating rating={rating} />
      </div>

      {/* Quote text */}
      <p className="text-sm sm:text-base text-white/65 leading-relaxed flex-1 italic">
        &ldquo;{quote}&rdquo;
      </p>

      {/* Client info */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/6">
        {/* Avatar placeholder */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-700 to-gold-500 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-charcoal-950">
            {name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="text-xs text-white/35 tracking-wide">{role}</p>
        </div>
      </div>
    </div>
  )
}
