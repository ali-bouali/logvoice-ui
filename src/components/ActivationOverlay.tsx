import { Power } from 'lucide-react'

interface ActivationOverlayProps {
  onActivate: () => void
}

export function ActivationOverlay({ onActivate }: ActivationOverlayProps) {
  return (
    <div className="bg-grid absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-bg-deep/95 px-6 text-center">
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="animate-scan absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      </div>

      <p className="relative text-[11px] tracking-[0.4em] text-muted">LOGVOICE SENTINEL</p>
      <h1 className="text-glow relative font-display text-2xl tracking-[0.15em] text-primary sm:text-3xl">
        SYSTEM STANDING BY
      </h1>
      <p className="relative max-w-sm text-[13px] leading-relaxed text-muted">
        Initialize the audio channel once — every alert after that will speak
        the moment it arrives, no further action needed.
      </p>

      <button
        type="button"
        onClick={onActivate}
        className="group relative mt-2 flex items-center gap-3 rounded-full border border-primary/50 bg-primary/10 px-6 py-3 text-primary transition-all hover:bg-primary/20 hover:shadow-[0_0_30px_rgba(0,240,255,0.35)] cursor-pointer"
      >
        <Power size={18} className="animate-pulse-slow" />
        <span className="font-display text-sm tracking-[0.3em]">INITIALIZE</span>
      </button>
    </div>
  )
}
