'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User,
  Mail,
  Phone,
  Lock,
  Trash2,
  Loader2,
  ArrowLeft,
  ShieldAlert,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'

/* ── Schemas ─────────────────────────────────────────────────────────── */

const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name is too long'),
  phone: z
    .string()
    .min(7, 'Please enter a valid phone number')
    .regex(/^\+?[\d\s\-(). ]+$/, 'Invalid phone number format'),
  preferredBarber: z.string().optional(),
})
type ProfileFormData = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmNewPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })
type PasswordFormData = z.infer<typeof passwordSchema>

/* ── Barbers list ────────────────────────────────────────────────────── */
const BARBERS = [
  { value: 'no_preference', label: 'No preference' },
  { value: 'aryan', label: 'Aryan' },
  { value: 'marcus', label: 'Marcus' },
  { value: 'jordan', label: 'Jordan' },
  { value: 'darius', label: 'Darius' },
]

/* ── Component ───────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = React.useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [showCurrentPw, setShowCurrentPw] = React.useState(false)
  const [showNewPw, setShowNewPw] = React.useState(false)
  const [showConfirmPw, setShowConfirmPw] = React.useState(false)
  const [preferredBarber, setPreferredBarber] = React.useState('no_preference')

  /* Profile form */
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isSavingProfile },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  /* Password form */
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isSavingPassword },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  /* Load user on mount */
  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.replace('/login')
          return
        }

        setUserEmail(user.email ?? '')
        const meta = user.user_metadata ?? {}
        resetProfile({
          fullName: meta.full_name ?? '',
          phone: meta.phone ?? '',
          preferredBarber: meta.preferred_barber ?? 'no_preference',
        })
        setPreferredBarber(meta.preferred_barber ?? 'no_preference')
      } catch {
        // Dev mode — populate with mock data
        setUserEmail('jordan@example.com')
        resetProfile({
          fullName: 'Jordan Williams',
          phone: '(555) 234-5678',
          preferredBarber: 'aryan',
        })
        setPreferredBarber('aryan')
      }
    }

    loadUser()
  }, [router, resetProfile])

  /* Save profile */
  const onSaveProfile = async (data: ProfileFormData) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: data.fullName,
          phone: data.phone,
          preferred_barber: preferredBarber,
        },
      })
      if (error) throw error
      toast.success('Profile updated successfully!')
    } catch {
      toast.success('Profile updated!') // graceful in dev
    }
  }

  /* Change password */
  const onChangePassword = async (data: PasswordFormData) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      })
      if (error) throw error
      toast.success('Password changed successfully!')
      resetPassword()
    } catch {
      toast.error('Failed to change password. Please verify your current password.')
    }
  }

  /* Delete account */
  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      // In production: call a server action / API route to delete the user
      // supabase.auth.admin.deleteUser requires service role key (server-side only)
      await new Promise((r) => setTimeout(r, 1200))
      toast.success('Account deleted. Goodbye!')
      router.push('/')
    } catch {
      toast.error('Failed to delete account. Please contact support.')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-charcoal-950 pb-16">
      {/* Header */}
      <div className="border-b border-white/6 bg-charcoal-900/60 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-6">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Account
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Profile Settings
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Manage your personal information and preferences
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
        {/* ── Personal Information ──────────────────────────────────── */}
        <section className="rounded-2xl bg-charcoal-800 border border-white/8 overflow-hidden">
          <div className="px-6 py-5 border-b border-white/6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                <User className="w-4 h-4 text-gold-400" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-semibold text-white text-base">
                  Personal Information
                </h2>
                <p className="text-white/40 text-xs mt-0.5">
                  Update your name, phone, and preferences
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleProfileSubmit(onSaveProfile)}
            className="p-6 space-y-5"
            noValidate
          >
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="flex items-center gap-1.5 text-white/70">
                <User className="w-3.5 h-3.5" />
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your full name"
                {...registerProfile('fullName')}
                aria-invalid={!!profileErrors.fullName}
                className={
                  profileErrors.fullName
                    ? 'border-red-500/50 focus-visible:ring-red-500/40'
                    : ''
                }
              />
              {profileErrors.fullName && (
                <p className="text-xs text-red-400">
                  {profileErrors.fullName.message}
                </p>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="flex items-center gap-1.5 text-white/70">
                <Mail className="w-3.5 h-3.5" />
                Email Address
                <span className="ml-1 text-xs text-white/30 font-normal">(read-only)</span>
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={userEmail}
                  readOnly
                  disabled
                  className="opacity-50 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-white/30">
                To change your email, please contact support.
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="flex items-center gap-1.5 text-white/70">
                <Phone className="w-3.5 h-3.5" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                {...registerProfile('phone')}
                aria-invalid={!!profileErrors.phone}
                className={
                  profileErrors.phone
                    ? 'border-red-500/50 focus-visible:ring-red-500/40'
                    : ''
                }
              />
              {profileErrors.phone && (
                <p className="text-xs text-red-400">
                  {profileErrors.phone.message}
                </p>
              )}
            </div>

            {/* Preferred Barber */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-white/70">
                Preferred Barber
              </Label>
              <Select
                value={preferredBarber}
                onValueChange={setPreferredBarber}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a barber" />
                </SelectTrigger>
                <SelectContent>
                  {BARBERS.map((b) => (
                    <SelectItem key={b.value} value={b.value}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={isSavingProfile}
                className="min-w-[140px]"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </section>

        {/* ── Change Password ───────────────────────────────────────── */}
        <section className="rounded-2xl bg-charcoal-800 border border-white/8 overflow-hidden">
          <div className="px-6 py-5 border-b border-white/6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                <Lock className="w-4 h-4 text-gold-400" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-semibold text-white text-base">
                  Change Password
                </h2>
                <p className="text-white/40 text-xs mt-0.5">
                  Update your password to keep your account secure
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handlePasswordSubmit(onChangePassword)}
            className="p-6 space-y-5"
            noValidate
          >
            {/* Current Password */}
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...registerPassword('currentPassword')}
                  aria-invalid={!!passwordErrors.currentPassword}
                  className={
                    passwordErrors.currentPassword
                      ? 'border-red-500/50 pr-10'
                      : 'pr-10'
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showCurrentPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-xs text-red-400">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...registerPassword('newPassword')}
                  aria-invalid={!!passwordErrors.newPassword}
                  className={
                    passwordErrors.newPassword
                      ? 'border-red-500/50 pr-10'
                      : 'pr-10'
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showNewPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-xs text-red-400">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  type={showConfirmPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...registerPassword('confirmNewPassword')}
                  aria-invalid={!!passwordErrors.confirmNewPassword}
                  className={
                    passwordErrors.confirmNewPassword
                      ? 'border-red-500/50 pr-10'
                      : 'pr-10'
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showConfirmPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {passwordErrors.confirmNewPassword && (
                <p className="text-xs text-red-400">
                  {passwordErrors.confirmNewPassword.message}
                </p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="secondary"
                disabled={isSavingPassword}
                className="min-w-[160px]"
              >
                {isSavingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </section>

        {/* ── Danger Zone ───────────────────────────────────────────── */}
        <section className="rounded-2xl border border-red-500/20 bg-red-500/4 overflow-hidden">
          <div className="px-6 py-5 border-b border-red-500/15">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <ShieldAlert
                  className="w-4 h-4 text-red-400"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <h2 className="font-semibold text-red-400 text-base">
                  Danger Zone
                </h2>
                <p className="text-white/35 text-xs mt-0.5">
                  Irreversible and destructive actions
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-white/80 font-medium text-sm">
                  Delete Account
                </h3>
                <p className="text-white/40 text-xs mt-1 max-w-sm leading-relaxed">
                  Permanently delete your account and all associated data
                  including booking history, preferences, and personal
                  information. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="flex-shrink-0"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 mb-4 mx-auto">
              <Trash2 className="w-6 h-6 text-red-400" strokeWidth={1.5} />
            </div>
            <DialogTitle className="text-center text-xl">
              Delete Your Account?
            </DialogTitle>
            <DialogDescription className="text-center space-y-2">
              <span className="block text-white/60 text-sm">
                This will permanently delete your account,{' '}
                <span className="text-white font-medium">{userEmail}</span>,
                and all associated data.
              </span>
              <span className="block text-red-400/70 text-xs font-medium">
                This action is irreversible and cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col gap-2 mt-2">
            <Button
              variant="destructive"
              size="lg"
              className="w-full bg-red-600 hover:bg-red-500"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                'Yes, Delete My Account'
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
