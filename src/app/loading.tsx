import { Scissors } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center gap-8 px-4">
      {/* Animated logo mark */}
      <div className="relative flex items-center justify-center">
        {/* Outer pulse ring */}
        <span className="absolute inline-flex h-20 w-20 rounded-full bg-gold-500/10 animate-ping" />
        {/* Icon container */}
        <div className="relative w-16 h-16 rounded-2xl bg-charcoal-800 border border-gold-500/20 flex items-center justify-center shadow-[var(--shadow-gold)]">
          <Scissors
            className="w-7 h-7 text-gold-400 animate-[spin_2s_linear_infinite]"
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Brand name */}
      <div className="text-center space-y-1">
        <p className="font-display text-xl font-semibold text-white/80 tracking-wide">
          Aryan Blendz
        </p>
        <p className="text-white/30 text-sm tracking-widest uppercase">
          Loading&hellip;
        </p>
      </div>

      {/* Skeleton content hint */}
      <div className="w-full max-w-2xl space-y-3 mt-4 animate-pulse">
        <div className="h-3 bg-charcoal-800 rounded-full w-3/4 mx-auto" />
        <div className="h-3 bg-charcoal-800 rounded-full w-1/2 mx-auto" />
        <div className="h-3 bg-charcoal-800 rounded-full w-2/3 mx-auto" />
      </div>
    </div>
  )
}
