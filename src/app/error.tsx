'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to the console (replace with a real error reporting service in production)
    console.error('[Aryan Blendz] Unhandled error:', error)
  }, [error])

  return (
    <main className="min-h-screen bg-charcoal-950 flex items-center justify-center relative overflow-hidden px-4">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-red-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="text-center relative z-10 max-w-md mx-auto animate-fade-in">
        {/* Warning icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400/70" strokeWidth={1.5} />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
          Something went wrong
        </h1>

        {/* Message */}
        <p className="text-white/50 text-base mb-2 leading-relaxed">
          An unexpected error occurred. Our team has been notified and we&apos;re
          working on a fix.
        </p>

        {/* Error digest for support reference */}
        {error.digest && (
          <p className="text-white/25 text-xs font-mono mb-8">
            Error ID: {error.digest}
          </p>
        )}
        {!error.digest && <div className="mb-8" />}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" onClick={reset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
          <Button variant="outline" size="lg" asChild className="gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              Return Home
            </Link>
          </Button>
        </div>

        {/* Support note */}
        <p className="text-white/20 text-sm mt-10">
          Still having trouble?{' '}
          <Link
            href="/contact"
            className="text-gold-400/50 hover:text-gold-400 transition-colors underline underline-offset-2"
          >
            Contact support
          </Link>
        </p>
      </div>
    </main>
  )
}
