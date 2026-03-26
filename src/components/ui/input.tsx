import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-white/10 bg-charcoal-900 px-3 py-2 text-sm text-white placeholder:text-white/30',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:border-gold-500/50',
          'hover:border-white/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white',
          '[&:-webkit-autofill]:bg-charcoal-900 [&:-webkit-autofill]:[box-shadow:0_0_0_30px_#111111_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
