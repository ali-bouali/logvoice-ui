import { useEffect, useState } from 'react'
import { Volume2 } from 'lucide-react'
import type { LogVoiceEvent } from '../types'
import { LEVEL_STYLE, relativeTime } from '../level'

interface LogFeedProps {
  events: LogVoiceEvent[]
  currentEventId: string | null
}

export function LogFeed({ events, currentEventId }: LogFeedProps) {
  const [, forceTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-1 pb-2">
        <h2 className="text-[11px] tracking-[0.3em] text-muted">TRANSMISSION LOG</h2>
        <span className="text-[11px] tabular-nums text-muted">{events.length}</span>
      </div>

      {events.length === 0 && (
        <div className="flex flex-1 items-center justify-center text-center text-[12px] leading-relaxed text-muted/70">
          No alerts yet.
          <br />
          Awaiting incoming signal…
        </div>
      )}

      <ul className="flex-1 space-y-2 overflow-y-auto pr-1">
        {events.map((event) => {
          const style = LEVEL_STYLE[event.level]
          const active = event.id === currentEventId
          return (
            <li
              key={event.id}
              className={`animate-rise rounded-lg border ${style.border} ${active ? 'bg-white/[0.06]' : 'bg-card/60'} px-3 py-2.5 backdrop-blur-sm transition-colors`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`font-display text-[10px] tracking-[0.2em] ${style.text}`}>{style.label}</span>
                <span className="flex items-center gap-1 text-[10px] text-muted">
                  {active && <Volume2 size={11} className="text-accent" />}
                  {relativeTime(event.timestamp)}
                </span>
              </div>
              <p className="mt-1 truncate text-[12px] font-medium text-white/90">{event.service}</p>
              <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-muted">{event.message}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
