import { useEffect, useState } from 'react'
import { Activity, Radio, WifiOff } from 'lucide-react'
import type { ConnectionStatus } from '../types'

interface StatusBarProps {
  connectionStatus: ConnectionStatus
  isSpeaking: boolean
}

export function StatusBar({ connectionStatus, isSpeaking }: StatusBarProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const state = isSpeaking ? 'SPEAKING' : connectionStatus === 'online' ? 'LISTENING' : 'STANDBY'
  const dotColor = isSpeaking ? 'bg-accent' : connectionStatus === 'online' ? 'bg-primary' : 'bg-muted'

  return (
    <header className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-2.5 w-2.5 items-center justify-center">
          <span className={`absolute inline-flex h-full w-full rounded-full ${dotColor} ${isSpeaking ? 'animate-ping' : ''} opacity-75`} />
          <span className={`relative inline-flex h-2 w-2 rounded-full ${dotColor}`} />
        </div>
        <div className="leading-tight">
          <p className="text-glow font-display text-[13px] tracking-[0.35em] text-primary sm:text-sm">LOGVOICE</p>
          <p className="text-[10px] tracking-[0.25em] text-muted sm:text-[11px]">SENTINEL // {state}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden items-center gap-1.5 text-[11px] tracking-widest text-muted sm:flex">
          {connectionStatus === 'online' ? (
            <Radio size={13} className="text-primary" />
          ) : (
            <WifiOff size={13} className="text-danger" />
          )}
          <span className={connectionStatus === 'online' ? 'text-primary' : 'text-danger'}>
            {connectionStatus === 'online' ? 'LINK OK' : connectionStatus === 'connecting' ? 'LINKING' : 'LINK LOST'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] tracking-widest text-muted">
          <Activity size={13} className={isSpeaking ? 'text-accent' : 'text-primary'} />
          <span className="tabular-nums text-white/80">
            {now.toLocaleTimeString([], { hour12: false })}
          </span>
        </div>
      </div>
    </header>
  )
}
