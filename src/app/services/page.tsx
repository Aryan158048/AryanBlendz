import Link from 'next/link'
import { Clock, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getDurationLabel } from '@/lib/utils'

interface ServiceDetail {
  id: string
  name: string
  duration: number
  price: number
  description: string
  icon: string
  includes: string[]
  category: string
}

const SERVICES: ServiceDetail[] = [
  {
    id: '1',
    name: 'Haircut',
    duration: 45,
    price: 35,
    description: 'Classic or modern cut styled to perfection. Whether you want a timeless style or something fresh, we bring your vision to life with expert precision.',
    icon: '✂️',
    category: 'Haircut',
    includes: [
      'Consultation & style recommendation',
      'Precision cut with straight razor finish',
      'Hot towel & styled to perfection',
    ],
  },
  {
    id: '2',
    name: 'Beard Trim',
    duration: 30,
    price: 25,
    description: 'Shape and define your beard with expert precision. From light maintenance to full reshaping, we craft a look that frames your face perfectly.',
    icon: '🪒',
    category: 'Beard',
    includes: [
      'Beard consultation & shaping plan',
      'Precision trim & line definition',
      'Hot towel finish & beard oil treatment',
    ],
  },
  {
    id: '3',
    name: 'Lineup',
    duration: 20,
    price: 20,
    description: 'Sharp edges and clean lines that make all the difference. A fresh lineup transforms any cut into something crisp and polished.',
    icon: '📐',
    category: 'Styling',
    includes: [
      'Edge-up along hairline, temples & nape',
      'Straight razor for surgical precision',
      'Clean finish with styling product',
    ],
  },
  {
    id: '4',
    name: 'Haircut + Beard',
    duration: 70,
    price: 55,
    description: 'The complete grooming package — your best look from top to jaw. Save when you combine both services into one seamless session.',
    icon: '⭐',
    category: 'Combo',
    includes: [
      'Full precision haircut with consultation',
      'Beard trim, shaping & line definition',
      'Hot towel service & premium product finish',
    ],
  },
  {
    id: '5',
    name: "Kid's Cut",
    duration: 30,
    price: 25,
    description: 'Ages 12 and under. A fun, stress-free experience for the young ones. We make sure every kid leaves looking sharp and feeling great.',
    icon: '👦',
    category: 'Kids',
    includes: [
      'Kid-friendly, gentle approach',
      'Classic or modern style based on preference',
      'Styled & finished with care',
    ],
  },
  {
    id: '6',
    name: 'Premium Package',
    duration: 90,
    price: 75,
    description: 'The full grooming experience with premium products and extra attention to detail. Our most luxurious service — treat yourself.',
    icon: '👑',
    category: 'Premium',
    includes: [
      'Haircut + beard service with priority booking',
      'Premium hair & beard product treatment',
      'Scalp massage, hot towel & styling session',
    ],
  },
]

const FAQS = [
  {
    question: 'Do I need to book in advance?',
    answer: 'We highly recommend booking ahead to secure your preferred time and barber. Walk-ins are welcome based on availability, but slots fill up fast — especially on weekends.',
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'You can cancel or reschedule for free up to 24 hours before your appointment. Cancellations within 24 hours may be subject to a late cancellation fee.',
  },
  {
    question: 'How long does each service take?',
    answer: 'Service durations are listed on each card. Please arrive a few minutes early so we can start right on time. If you\'re combining services, the times are additive.',
  },
  {
    question: 'Can I choose my barber?',
    answer: 'Absolutely. During booking you can select your preferred barber or choose "Any Available" to get the next open slot across all barbers.',
  },
  {
    question: 'Do you offer group bookings?',
    answer: 'Yes! For group bookings (3+ people), please contact us directly so we can coordinate multiple barbers and ensure everyone is taken care of.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards, cash, and digital payments. Payment is collected at the time of your appointment.',
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-charcoal-950">
      {/* Hero */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-500/6 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center space-y-5">
          <Badge variant="default" className="mb-2">
            Premium Grooming Services
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white">
            Our{' '}
            <span className="text-gradient-gold">Services</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
            From sharp fades to full grooming packages — every service is delivered with
            expert precision and premium care.
          </p>
          <Button size="lg" asChild className="mt-4">
            <Link href="/booking">
              Book an Appointment
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Services grid */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((service) => (
              <div
                key={service.id}
                className="group bg-charcoal-800 rounded-xl border border-white/8 overflow-hidden hover:border-gold-500/40 transition-all duration-300 hover:shadow-[0_0_32px_rgba(201,168,76,0.12)] flex flex-col"
              >
                {/* Card header */}
                <div className="p-6 pb-4 border-b border-white/6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="text-4xl">{service.icon}</div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {service.category}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold text-white font-display group-hover:text-gold-300 transition-colors">
                    {service.name}
                  </h2>
                  <p className="text-white/40 text-sm mt-1.5 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Price & duration */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-white/6">
                  <div className="flex items-center gap-1.5 text-white/40">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{getDurationLabel(service.duration)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-gold-400">${service.price}</span>
                  </div>
                </div>

                {/* What's included */}
                <div className="px-6 py-4 flex-1">
                  <p className="text-white/30 text-xs uppercase tracking-wider font-medium mb-3">
                    What&apos;s Included
                  </p>
                  <ul className="space-y-2">
                    {service.includes.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-gold-500/70 flex-shrink-0 mt-0.5" />
                        <span className="text-white/60 text-sm leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Book button */}
                <div className="p-6 pt-4">
                  <Button
                    asChild
                    className="w-full gap-2 group-hover:shadow-[var(--shadow-gold)]"
                  >
                    <Link href={`/booking?service=${service.id}`}>
                      Book This Service
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* FAQ */}
      <section className="px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
              Frequently Asked{' '}
              <span className="text-gradient-gold">Questions</span>
            </h2>
            <p className="text-white/40 text-base">
              Everything you need to know before booking your appointment.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => (
              <details
                key={index}
                className="group bg-charcoal-800 rounded-xl border border-white/8 hover:border-white/12 transition-colors overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-3 p-5 cursor-pointer list-none select-none">
                  <span className="text-white font-medium text-sm sm:text-base pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gold-500 flex-shrink-0 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-5">
                  <div className="h-px bg-white/6 mb-4" />
                  <p className="text-white/50 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-10 text-center space-y-4">
            <p className="text-white/40 text-sm">
              Still have questions? We&apos;re happy to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" asChild>
                <Link href="/contact">Get in Touch</Link>
              </Button>
              <Button asChild>
                <Link href="/booking">
                  Book Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
