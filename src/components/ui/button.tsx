'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-950 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-gold text-charcoal-950 font-semibold shadow-[var(--shadow-gold)] hover:opacity-90 hover:shadow-[var(--shadow-gold-lg)] active:scale-[0.98]',
        destructive:
          'bg-red-600 text-white shadow-sm hover:bg-red-500 active:scale-[0.98]',
        outline:
          'border border-gold-500/30 bg-transparent text-gold-400 hover:bg-gold-500/10 hover:border-gold-400/60 hover:text-gold-300 active:scale-[0.98]',
        secondary:
          'bg-charcoal-800 text-white border border-white/8 hover:bg-charcoal-700 hover:border-white/12 active:scale-[0.98]',
        ghost:
          'bg-transparent text-white/70 hover:bg-white/6 hover:text-white active:scale-[0.98]',
        link:
          'bg-transparent text-gold-400 underline-offset-4 hover:underline hover:text-gold-300 p-0 h-auto',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
