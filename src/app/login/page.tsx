'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Scissors, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      toast.error('Invalid email or password', {
        description: 'Please check your credentials and try again.',
      })
      setIsLoading(false)
      return
    }

    // Check role to decide where to redirect
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoading(false); return }

    const { data: userRow } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    toast.success('Welcome back!', { description: 'Signed in successfully.' })

    const redirectTo = searchParams.get('redirectTo')
    if (userRow?.role === 'admin') {
      router.push(redirectTo ?? '/admin')
    } else {
      router.push(redirectTo ?? '/account')
    }
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-charcoal-950 flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-gold-700/8 blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-gold-500/6 blur-[80px] pointer-events-none" />

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
            <h1 className="font-display text-3xl font-bold text-white mb-1">
              Welcome back
            </h1>
            <p className="text-white/50 text-sm">
              Sign in to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white/80 text-sm font-medium">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-gold-400 text-xs hover:text-gold-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <p className="text-center text-white/50 text-sm mt-5">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-gold-400 hover:text-gold-300 font-medium transition-colors"
            >
              Sign up
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
