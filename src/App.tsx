import { useCallback, useState } from 'react'
import { Terminal } from 'lucide-react'
import { CoreOrb } from './components/CoreOrb'
import { StatusBar } from './components/StatusBar'
import { LogFeed } from './components/LogFeed'
import { ActivationOverlay } from './components/ActivationOverlay'
import { InjectPanel } from './components/InjectPanel'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { useLogVoiceStream } from './hooks/useLogVoiceStream'
import type { LogVoiceEvent } from './types'

export default function App() {
  const { unlock, unlocked, enqueue, isSpeaking, currentEvent, analyserRef } = useAudioPlayer()
  const [injectOpen, setInjectOpen] = useState(false)

  const handleEvent = useCallback(
    (event: LogVoiceEvent) => {
      enqueue(event)
    },
    [enqueue],
  )

  const { events, status } = useLogVoiceStream(handleEvent)

  return (
    <div className="bg-grid relative h-dvh w-dvw overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(0,240,255,0.08),transparent_60%)]" />

      {!unlocked && <ActivationOverlay onActivate={unlock} />}

      <div className="relative flex h-full flex-col">
        <StatusBar connectionStatus={status} isSpeaking={isSpeaking} />

        <main className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4 sm:px-6 sm:pb-6 lg:flex-row lg:gap-6">
          <section className="flex flex-1 flex-col items-center justify-center gap-6 py-2">
            <CoreOrb analyserRef={analyserRef} isSpeaking={isSpeaking} level={currentEvent?.level ?? null} />

            <div className="h-16 max-w-md text-center">
              {currentEvent ? (
                <>
                  <p className="font-display text-[11px] tracking-[0.3em] text-muted">
                    {currentEvent.service.toUpperCase()}
                  </p>
                  <p className="animate-flicker mt-1 text-[13px] leading-relaxed text-white/85">
                    {currentEvent.message}
                  </p>
                </>
              ) : (
                <p className="text-[12px] tracking-[0.15em] text-muted">
                  {status === 'online' ? 'Listening for system alerts…' : 'Establishing uplink…'}
                </p>
              )}
            </div>
          </section>

          <aside className="w-full shrink-0 rounded-2xl border border-border bg-card/50 p-4 pb-20 backdrop-blur-md lg:w-[340px] lg:pb-4">
            <LogFeed events={events} currentEventId={currentEvent?.id ?? null} />
          </aside>
        </main>
      </div>

      {unlocked && (
        <button
          type="button"
          onClick={() => setInjectOpen(true)}
          className="absolute bottom-5 right-5 z-30 flex cursor-pointer items-center gap-2 rounded-full border border-primary/40 bg-card/80 px-4 py-2.5 text-primary shadow-[0_0_25px_rgba(0,240,255,0.15)] backdrop-blur-md transition-all hover:bg-primary/10 sm:bottom-6 sm:right-6"
        >
          <Terminal size={15} />
          <span className="font-display text-[11px] tracking-[0.2em]">INJECT LOG</span>
        </button>
      )}

      <InjectPanel open={injectOpen} onClose={() => setInjectOpen(false)} />
    </div>
  )
}
