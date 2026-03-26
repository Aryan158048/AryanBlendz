'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Phone, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const customerSchema = z.object({
  customerName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens and apostrophes'),
  customerEmail: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  customerPhone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d\s\-().]{7,15}$/, 'Please enter a valid phone number'),
  notes: z.string().max(300, 'Notes must be under 300 characters').optional(),
})

type CustomerFormValues = z.infer<typeof customerSchema>

interface CustomerFormProps {
  values: {
    customerName: string
    customerEmail: string
    customerPhone: string
    notes: string
  }
  onChange: (values: Partial<CustomerFormProps['values']>) => void
  onValidChange: (isValid: boolean) => void
  lockedUser?: { name: string; email: string }
}

interface FieldWrapperProps {
  label: string
  icon: React.ReactNode
  error?: string
  isValid?: boolean
  required?: boolean
  children: React.ReactNode
  hint?: string
}

function FieldWrapper({ label, icon, error, isValid, required, children, hint }: FieldWrapperProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-white/70 text-sm font-medium">
        <span className="text-gold-500/70">{icon}</span>
        {label}
        {required && <span className="text-gold-500">*</span>}
      </Label>
      <div className="relative">
        {children}
        {isValid && !error && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
        )}
        {error && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400 pointer-events-none" />
        )}
      </div>
      {error && (
        <p className="text-red-400 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-white/25 text-xs">{hint}</p>
      )}
    </div>
  )
}

const inputClass = (hasError: boolean, isValid: boolean) =>
  cn(
    'bg-charcoal-900 border text-white placeholder:text-white/25 focus:ring-0 focus-visible:ring-0 pr-10 transition-colors duration-200',
    hasError
      ? 'border-red-500/60 focus:border-red-500'
      : isValid
        ? 'border-emerald-500/40 focus:border-emerald-500/60'
        : 'border-white/10 focus:border-gold-500/50 hover:border-white/20',
  )

export function CustomerForm({ values, onChange, onValidChange, lockedUser }: CustomerFormProps) {
  const {
    register,
    formState: { errors, touchedFields, isValid },
    watch,
    trigger,
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    mode: 'onChange',
    defaultValues: {
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      customerPhone: values.customerPhone,
      notes: values.notes,
    },
  })

  const watchedValues = watch()

  useEffect(() => {
    onChange({
      customerName: watchedValues.customerName || '',
      customerEmail: watchedValues.customerEmail || '',
      customerPhone: watchedValues.customerPhone || '',
      notes: watchedValues.notes || '',
    })
  }, [
    watchedValues.customerName,
    watchedValues.customerEmail,
    watchedValues.customerPhone,
    watchedValues.notes,
  ])

  useEffect(() => {
    onValidChange(isValid)
  }, [isValid, onValidChange])

  // When locked fields are pre-filled, trigger validation immediately so the form is valid
  useEffect(() => {
    if (lockedUser) trigger()
  }, [lockedUser, trigger])

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
          Your Details
        </h2>
        <p className="text-white/50 text-sm">
          {lockedUser
            ? 'Just add your phone number and any notes'
            : "We'll send your booking confirmation to these details"}
        </p>
      </div>

      {lockedUser && (
        <div className="flex items-center gap-3 bg-gold-500/8 border border-gold-500/20 rounded-xl px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-gold-500/15 border border-gold-500/25 flex items-center justify-center text-sm font-bold text-gold-400 font-display flex-shrink-0">
            {lockedUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{lockedUser.name}</p>
            <p className="text-white/40 text-xs truncate">{lockedUser.email}</p>
          </div>
          <span className="text-xs text-gold-400/70 ml-auto flex-shrink-0">Signed in</span>
        </div>
      )}

      <div className="bg-charcoal-800 rounded-xl border border-white/8 p-6 space-y-5">
        {!lockedUser && (
          <FieldWrapper
            label="Full Name"
            icon={<User className="w-3.5 h-3.5" />}
            error={touchedFields.customerName ? errors.customerName?.message : undefined}
            isValid={touchedFields.customerName && !errors.customerName && !!watchedValues.customerName}
            required
          >
            <Input
              {...register('customerName')}
              placeholder="John Smith"
              className={inputClass(
                !!(touchedFields.customerName && errors.customerName),
                !!(touchedFields.customerName && !errors.customerName && !!watchedValues.customerName),
              )}
            />
          </FieldWrapper>
        )}

        <div className={lockedUser ? 'space-y-5' : 'grid grid-cols-1 sm:grid-cols-2 gap-5'}>
          {!lockedUser && (
            <FieldWrapper
              label="Email Address"
              icon={<Mail className="w-3.5 h-3.5" />}
              error={touchedFields.customerEmail ? errors.customerEmail?.message : undefined}
              isValid={touchedFields.customerEmail && !errors.customerEmail && !!watchedValues.customerEmail}
              required
              hint="For booking confirmation"
            >
              <Input
                {...register('customerEmail')}
                type="email"
                placeholder="john@example.com"
                className={inputClass(
                  !!(touchedFields.customerEmail && errors.customerEmail),
                  !!(touchedFields.customerEmail && !errors.customerEmail && !!watchedValues.customerEmail),
                )}
              />
            </FieldWrapper>
          )}

          <FieldWrapper
            label="Phone Number"
            icon={<Phone className="w-3.5 h-3.5" />}
            error={touchedFields.customerPhone ? errors.customerPhone?.message : undefined}
            isValid={touchedFields.customerPhone && !errors.customerPhone && !!watchedValues.customerPhone}
            required
            hint="For appointment reminders"
          >
            <Input
              {...register('customerPhone')}
              type="tel"
              placeholder="(555) 123-4567"
              className={inputClass(
                !!(touchedFields.customerPhone && errors.customerPhone),
                !!(touchedFields.customerPhone && !errors.customerPhone && !!watchedValues.customerPhone),
              )}
            />
          </FieldWrapper>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-white/70 text-sm font-medium">
            <MessageSquare className="w-3.5 h-3.5 text-gold-500/70" />
            Notes / Special Requests
            <span className="text-white/25 text-xs font-normal ml-auto">
              {(watchedValues.notes || '').length}/300
            </span>
          </Label>
          <Textarea
            {...register('notes')}
            placeholder="Any special requests, preferred styles, or things we should know..."
            rows={3}
            className={cn(
              'bg-charcoal-900 border text-white placeholder:text-white/25 focus:ring-0 focus-visible:ring-0 resize-none transition-colors duration-200',
              errors.notes
                ? 'border-red-500/60'
                : 'border-white/10 focus:border-gold-500/50 hover:border-white/20',
            )}
          />
          {errors.notes && (
            <p className="text-red-400 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {errors.notes.message}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-white/6">
          <p className="text-white/25 text-xs leading-relaxed">
            By booking, you agree to our cancellation policy. Free cancellation up to 24 hours before your appointment.
            Your information will only be used for appointment management.
          </p>
        </div>
      </div>
    </div>
  )
}
