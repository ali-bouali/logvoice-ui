import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { AlertTriangle, Send, Terminal, X } from 'lucide-react'
import type { LogLevel } from '../types'
import { submitLogEvent } from '../api'
import { LEVEL_STYLE } from '../level'

const PRESETS: Record<LogLevel, { service: string; message: string }> = {
  INFO: { service: 'billing-service', message: 'nightly reconciliation job completed successfully' },
  WARN: { service: 'auth-service', message: 'token refresh latency creeping above 800ms' },
  ERROR: { service: 'payment-service', message: 'connection pool exhausted, 500 errors spiking' },
}

interface InjectPanelProps {
  open: boolean
  onClose: () => void
}

export function InjectPanel({ open, onClose }: InjectPanelProps) {
  const formId = useId()
  const [level, setLevel] = useState<LogLevel>('ERROR')
  const [service, setService] = useState(PRESETS.ERROR.service)
  const [message, setMessage] = useState(PRESETS.ERROR.message)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function applyPreset(next: LogLevel) {
    setLevel(next)
    setService(PRESETS[next].service)
    setMessage(PRESETS[next].message)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await submitLogEvent({ level, service, message })
      // The generated alert arrives back through the SSE stream and
      // plays automatically — nothing else to do here.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transmission failed')
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-bg-deep/60 backdrop-blur-sm sm:items-center">
      <form
        onSubmit={handleSubmit}
        className="animate-rise relative w-full max-w-md rounded-t-2xl border border-border bg-card/95 p-5 shadow-[0_0_60px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:rounded-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted transition-colors hover:text-white cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="mb-4 flex items-center gap-2 text-primary">
          <Terminal size={16} />
          <h2 className="font-display text-[13px] tracking-[0.25em]">INJECT LOG EVENT</h2>
        </div>

        <div className="mb-4 flex gap-2">
          {(Object.keys(LEVEL_STYLE) as LogLevel[]).map((lvl) => {
            const style = LEVEL_STYLE[lvl]
            const selected = lvl === level
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => applyPreset(lvl)}
                className={`flex-1 cursor-pointer rounded-lg border px-2 py-2 text-[11px] tracking-[0.2em] transition-all ${
                  selected ? `${style.border} ${style.bg} ${style.text}` : 'border-border text-muted hover:text-white'
                }`}
              >
                {style.label}
              </button>
            )
          })}
        </div>

        <label htmlFor={`${formId}-service`} className="mb-1 block text-[11px] tracking-wide text-muted">
          Service
        </label>
        <input
          id={`${formId}-service`}
          value={service}
          onChange={(e) => setService(e.target.value)}
          required
          maxLength={80}
          className="mb-3 w-full rounded-lg border border-border bg-black/30 px-3 py-2 text-[13px] text-white outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
        />

        <label htmlFor={`${formId}-message`} className="mb-1 block text-[11px] tracking-wide text-muted">
          Message
        </label>
        <textarea
          id={`${formId}-message`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          maxLength={280}
          rows={3}
          className="mb-4 w-full resize-none rounded-lg border border-border bg-black/30 px-3 py-2 text-[13px] text-white outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
        />

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-[12px] text-danger">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-primary/50 bg-primary/10 py-2.5 text-primary transition-all hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={14} />
          <span className="font-display text-[12px] tracking-[0.25em]">{busy ? 'TRANSMITTING…' : 'TRANSMIT'}</span>
        </button>
      </form>
    </div>
  )
}
