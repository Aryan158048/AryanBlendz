'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Loader2,
  Share2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { CONTACT_EMAIL, CONTACT_PHONE, SHOP_ADDRESS, DAYS_OF_WEEK } from '@/lib/constants'
import { getPublicHours } from '@/app/actions/booking'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
})
type ContactFormValues = z.infer<typeof contactSchema>

const dayOrder = [1, 2, 3, 4, 5, 6, 0]

function fmt12h(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [hours, setHours] = useState<{ day_of_week: number; start_time: string; end_time: string; is_available: boolean }[]>([])

  useEffect(() => {
    getPublicHours().then(setHours).catch(() => {})
  }, [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (_data: ContactFormValues) => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1500))
    setIsSubmitting(false)
    setSubmitted(true)
    reset()
    toast.success("Message sent!", {
      description: "We'll get back to you within 24 hours.",
    })
  }

  const contactItems = [
    {
      icon: MapPin,
      label: 'Address',
      value: SHOP_ADDRESS,
      href: `https://maps.google.com/?q=${encodeURIComponent(SHOP_ADDRESS)}`,
    },
    {
      icon: Phone,
      label: 'Phone',
      value: CONTACT_PHONE,
      href: `tel:+12017489849`,
    },
    {
      icon: Mail,
      label: 'Email',
      value: CONTACT_EMAIL,
      href: `mailto:${CONTACT_EMAIL}`,
    },
    {
      icon: Share2,
      label: 'Instagram',
      value: '@aryanblendz',
      href: 'https://www.instagram.com/aryanblendz/',
    },
  ]

  return (
    <main className="min-h-screen bg-charcoal-950">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-500/6 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 animate-fade-in">
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-white mb-4">
            Get in{' '}
            <span className="text-gradient-gold">Touch</span>
          </h1>
          <p className="text-xl text-white/50 max-w-xl mx-auto">
            Questions, feedback, or just want to say hi? We&apos;re always happy to hear from you.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact Form */}
          <div className="lg:col-span-3 animate-slide-up">
            <div className="glass gold-border rounded-2xl p-6 sm:p-8">
              <h2 className="font-display text-2xl font-bold text-white mb-1">
                Send a Message
              </h2>
              <p className="text-white/40 text-sm mb-6">
                Fill out the form and we&apos;ll get back to you ASAP.
              </p>

              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-7 h-7 text-green-400" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-white/50 text-sm mb-6">
                    Thanks for reaching out. We&apos;ll reply within 24 hours.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white/70">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        className="bg-charcoal-900 border-white/10 text-white placeholder:text-white/25 focus:border-gold-500/50 h-11"
                        {...register('name')}
                      />
                      {errors.name && (
                        <p className="text-red-400 text-xs">{errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/70">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="bg-charcoal-900 border-white/10 text-white placeholder:text-white/25 focus:border-gold-500/50 h-11"
                        {...register('email')}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-xs">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white/70">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      placeholder="What's this about?"
                      className="bg-charcoal-900 border-white/10 text-white placeholder:text-white/25 focus:border-gold-500/50 h-11"
                      {...register('subject')}
                    />
                    {errors.subject && (
                      <p className="text-red-400 text-xs">{errors.subject.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white/70">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us what's on your mind..."
                      rows={5}
                      className="bg-charcoal-900 border-white/10 text-white placeholder:text-white/25 focus:border-gold-500/50 resize-none"
                      {...register('message')}
                    />
                    {errors.message && (
                      <p className="text-red-400 text-xs">{errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {/* Contact details */}
            <div className="glass gold-border rounded-2xl p-6">
              <h2 className="font-display text-xl font-bold text-white mb-5">
                Contact Info
              </h2>
              <div className="space-y-4">
                {contactItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500/20 transition-colors">
                        <Icon className="w-4 h-4 text-gold-400" />
                      </div>
                      <div>
                        <div className="text-white/40 text-xs mb-0.5">{item.label}</div>
                        <div className="text-white/80 text-sm group-hover:text-gold-400 transition-colors">
                          {item.value}
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Hours */}
            <div className="glass gold-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-gold-400" />
                <h3 className="font-display text-lg font-bold text-white">
                  Business Hours
                </h3>
              </div>
              <div className="space-y-2">
                {dayOrder.map((dayNum) => {
                  const dayLabel = DAYS_OF_WEEK.find((d) => d.value === dayNum)?.label ?? ''
                  const row = hours.find((h) => h.day_of_week === dayNum)
                  return (
                    <div key={dayNum} className="flex items-center justify-between">
                      <span className="text-white/50 text-sm">{dayLabel}</span>
                      {row?.is_available ? (
                        <span className="text-white/70 text-sm font-medium">
                          {fmt12h(row.start_time)} – {fmt12h(row.end_time)}
                        </span>
                      ) : (
                        <span className="text-white/30 text-sm">Closed</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="rounded-2xl gold-border overflow-hidden aspect-[16/10] relative bg-charcoal-900">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gold-400" />
                </div>
                <p className="text-white/40 text-sm font-medium">Find Me</p>
                <p className="text-white/25 text-xs text-center px-6">
                  Judson Suites, 103 Davidson Rd, Piscataway, NJ 08854
                </p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(SHOP_ADDRESS)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="mt-1 text-xs h-8">
                    Open in Maps
                  </Button>
                </a>
              </div>
              {/* Grid decoration */}
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
