'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Scissors, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    setEmailSent(true)
    setIsLoading(false)
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center relative overflow-hidden px-4">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold-500/5 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 animate-fade-in text-center">
          <div className="glass gold-border rounded-2xl p-10">
            <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-2">Check your email</h1>
            <p className="text-white/50 text-sm leading-relaxed mb-2">
              We sent a confirmation link to
            </p>
            <p className="text-gold-400 font-medium mb-6">{getValues('email')}</p>
            <p className="text-white/40 text-xs mb-8">
              Click the link in the email to activate your account. Check your spam folder if you don&apos;t see it.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">Back to Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-950 flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-gold-700/8 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-[var(--shadow-gold-lg)] group-hover:scale-105 transition-transform">
              <Scissors className="w-7 h-7 text-charcoal-950" />
            </div>
            <span className="font-display text-2xl font-bold text-gradient-gold">
              Aryan Blendz
            </span>
          </Link>
        </div>

        <div className="glass gold-border rounded-2xl p-8 shadow-[var(--shadow-dark-lg)]">
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold text-white mb-1">Create account</h1>
            <p className="text-white/50 text-sm">
              Save your info for faster booking
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white/80 text-sm font-medium">
                Full name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your name"
                autoComplete="name"
                className="bg-charcoal-900 border-white/10 text-white placeholder:text-white/30 focus:border-gold-500/50 h-11"
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-red-400 text-xs">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80 text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="bg-charcoal-900 border-white/10 text-white placeholder:text-white/30 focus:border-gold-500/50 h-11"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-red-400 text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80 text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className="bg-charcoal-900 border-white/10 text-white placeholder:text-white/30 focus:border-gold-500/50 h-11 pr-11"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/80 text-sm font-medium">
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className="bg-charcoal-900 border-white/10 text-white placeholder:text-white/30 focus:border-gold-500/50 h-11 pr-11"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Creating account...</>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <p className="text-center text-white/50 text-sm mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>

          <div className="relative my-6">
            <Separator className="bg-white/8" />
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-charcoal-800 px-3 text-white/30 text-xs">
              or
            </span>
          </div>

          <Button
            variant="ghost"
            className="w-full text-white/60 hover:text-white border border-white/8 hover:border-white/16"
            asChild
          >
            <Link href="/booking">Continue as guest &rarr; Book Now</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
