import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type { LogLevel } from '../types'
import { LEVEL_STYLE } from '../level'

interface CoreOrbProps {
  analyserRef: RefObject<AnalyserNode | null>
  isSpeaking: boolean
  level: LogLevel | null
}

const TICK_COUNT = 32

export function CoreOrb({ analyserRef, isSpeaking, level }: CoreOrbProps) {
  const glowRef = useRef<HTMLDivElement>(null)
  const coreRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const tickRefs = useRef<(HTMLDivElement | null)[]>([])
  const dataRef = useRef<Uint8Array | null>(null)

  useEffect(() => {
    let raf = 0

    const tick = () => {
      const analyser = analyserRef.current
      let amplitude = 0

      if (analyser) {
        if (!dataRef.current || dataRef.current.length !== analyser.frequencyBinCount) {
          dataRef.current = new Uint8Array(analyser.frequencyBinCount)
        }
        analyser.getByteFrequencyData(dataRef.current as Uint8Array<ArrayBuffer>)
        const data = dataRef.current
        let sum = 0
        for (let i = 0; i < data.length; i++) sum += data[i]
        amplitude = sum / data.length / 255

        for (let i = 0; i < TICK_COUNT; i++) {
          const el = tickRefs.current[i]
          if (!el) continue
          const v = data[Math.min(i * 2, data.length - 1)] / 255
          const active = isSpeaking ? 0.3 + v * 1.2 : 0.4
          el.style.opacity = String(Math.min(1, active))
          el.style.setProperty('--tick-scale', String(isSpeaking ? 0.6 + v * 0.8 : 0.55))
        }
      }

      const idleBreath = 0.12 + Math.sin(Date.now() / 900) * 0.05
      const boost = isSpeaking ? amplitude : idleBreath
      if (coreRef.current) coreRef.current.style.transform = `scale(${1 + boost * 0.4})`
      if (glowRef.current) glowRef.current.style.opacity = String(0.35 + boost * 0.65)
      if (ringRef.current) ringRef.current.style.opacity = String(0.5 + boost * 0.5)

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [analyserRef, isSpeaking])

  const color = level ? LEVEL_STYLE[level].hex : '#00f0ff'

  return (
    <div className="relative flex items-center justify-center h-[clamp(200px,30vw,380px)] w-[clamp(200px,30vw,380px)] shrink-0">
      <div className="absolute inset-0 rounded-full border animate-spin-slow" style={{ borderColor: `${color}30` }} />
      <div
        className="absolute inset-[8%] rounded-full border border-dashed animate-spin-slower"
        style={{ borderColor: `${color}50` }}
      />

      <div ref={ringRef} className="absolute inset-0" style={{ color, transition: 'color 0.6s ease' }}>
        {Array.from({ length: TICK_COUNT }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{ transform: `rotate(${(360 / TICK_COUNT) * i}deg)` }}
          >
            <div
              ref={(el) => {
                tickRefs.current[i] = el
              }}
              className="absolute left-1/2 top-[3%] h-[10%] w-[2px] -translate-x-1/2 rounded-full"
              style={{
                background: 'currentColor',
                transform: 'scaleY(var(--tick-scale, 0.5))',
                transformOrigin: 'top center',
              }}
            />
          </div>
        ))}
      </div>

      <div
        ref={glowRef}
        className="absolute inset-[12%] rounded-full blur-3xl"
        style={{ background: color, opacity: 0.45, transition: 'background 0.6s ease' }}
      />

      <div
        ref={coreRef}
        className="absolute inset-[28%] rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 30%, #ffffff, ${color} 42%, ${color}66 72%, transparent 100%)`,
          boxShadow: `0 0 50px ${color}aa, 0 0 110px ${color}44`,
          transition: 'background 0.6s ease, box-shadow 0.6s ease',
        }}
      />
      <div className="absolute inset-[28%] rounded-full ring-1 ring-white/25" />
    </div>
  )
}
