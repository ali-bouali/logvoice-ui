import { useCallback, useEffect, useRef, useState } from 'react'
import { audioUrl } from '../api'
import type { LogVoiceEvent } from '../types'

/**
 * Plays generated voice alerts back-to-back with zero user interaction
 * per alert, via the Web Audio API rather than HTMLMediaElement.play().
 *
 * Browsers require one prior user gesture before audio can play at all —
 * `unlock()` spends that gesture resuming the AudioContext. That's the
 * part that matters: once an AudioContext is running, scheduling new
 * AudioBufferSourceNodes from a later async callback (like an SSE
 * message, with no gesture anywhere on its call stack) is allowed in
 * every major browser. `<audio>.play()` called the same way is not
 * reliably allowed — Safari in particular requires play() itself to be
 * inside (or a direct promise continuation of) the original gesture, so
 * a later call from an EventSource handler can be silently blocked.
 */
export function useAudioPlayer() {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const queueRef = useRef<LogVoiceEvent[]>([])
  const unlockedRef = useRef(false)
  const playingRef = useRef(false)
  const playNextRef = useRef<() => void>(() => {})

  const [unlocked, setUnlocked] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<LogVoiceEvent | null>(null)

  const playNext = useCallback(() => {
    const ctx = audioCtxRef.current
    const next = queueRef.current.shift()

    if (!next || !ctx) {
      playingRef.current = false
      setIsSpeaking(false)
      setCurrentEvent(null)
      return
    }

    playingRef.current = true
    setCurrentEvent(next)
    setIsSpeaking(true)

    fetch(audioUrl(next))
      .then((res) => {
        if (!res.ok) throw new Error(`Audio fetch failed: ${res.status}`)
        return res.arrayBuffer()
      })
      .then((bytes) => ctx.decodeAudioData(bytes))
      .then((decoded) => {
        const source = ctx.createBufferSource()
        source.buffer = decoded
        source.connect(analyserRef.current ?? ctx.destination)
        source.onended = () => playNextRef.current()
        source.start()
      })
      .catch(() => {
        // Bad/missing audio file — don't stall the queue on one failure.
        playNextRef.current()
      })
  }, [])

  useEffect(() => {
    playNextRef.current = playNext
  }, [playNext])

  const enqueue = useCallback(
    (event: LogVoiceEvent) => {
      queueRef.current.push(event)
      if (unlockedRef.current && !playingRef.current) {
        playNext()
      }
    },
    [playNext],
  )

  const unlock = useCallback(() => {
    if (unlockedRef.current) return
    unlockedRef.current = true
    setUnlocked(true)

    const AudioContextCtor =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioContextCtor()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 128
    analyser.smoothingTimeConstant = 0.75
    analyser.connect(ctx.destination)
    audioCtxRef.current = ctx
    analyserRef.current = analyser

    void ctx.resume().then(() => {
      if (queueRef.current.length > 0 && !playingRef.current) playNext()
    })
  }, [playNext])

  return { unlock, unlocked, enqueue, isSpeaking, currentEvent, analyserRef }
}
