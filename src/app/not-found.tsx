import Link from 'next/link'
import { Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-charcoal-950 flex items-center justify-center relative overflow-hidden px-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gold-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="text-center relative z-10 animate-fade-in max-w-lg mx-auto">
        {/* Scissors icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
            <Scissors className="w-8 h-8 text-gold-400/60" strokeWidth={1.5} />
          </div>
        </div>

        {/* 404 */}
        <div className="font-display text-[9rem] sm:text-[12rem] font-bold text-gradient-gold leading-none mb-0 select-none">
          404
        </div>

        {/* Heading */}
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mt-2 mb-4">
          Page not found
        </h1>

        {/* Message */}
        <p className="text-white/50 text-lg mb-8 leading-relaxed">
          Looks like this page got a bad haircut and had to leave.
          <br />
          Let&apos;s get you back somewhere good.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/booking">Book Now</Link>
          </Button>
        </div>

        {/* Subtle note */}
        <p className="text-white/20 text-sm mt-10">
          If you think this is a mistake,{' '}
          <Link
            href="/contact"
            className="text-gold-400/50 hover:text-gold-400 transition-colors underline underline-offset-2"
          >
            contact us
          </Link>
        </p>
      </div>
    </main>
  )
}
