import { useEffect, useRef, useState } from 'react'
import { streamUrl } from '../api'
import type { ConnectionStatus, LogVoiceEvent } from '../types'

const MAX_FEED_LENGTH = 60

/**
 * Subscribes to the backend's SSE stream of generated voice alerts and
 * keeps a rolling feed. `onEvent` fires for every alert the moment it
 * arrives so the caller can queue it for playback immediately.
 */
export function useLogVoiceStream(onEvent: (event: LogVoiceEvent) => void) {
  const [events, setEvents] = useState<LogVoiceEvent[]>([])
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const onEventRef = useRef(onEvent)
  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])
  const seenIds = useRef(new Set<string>())

  useEffect(() => {
    const source = new EventSource(streamUrl())

    // The stream replays a short backlog on the *first* connect so the
    // feed isn't empty on load — but we don't want that replay to blast
    // out a queue of stale audio. Anything delivered in this grace
    // window right after the initial connect is shown, not spoken; only
    // genuinely live alerts play. The grace window is armed once, not on
    // every automatic reconnect — otherwise a dropped/reopened
    // connection would silently swallow the first real alert to land
    // right after it, even though it still shows up in the feed.
    let readyForPlayback = false
    let graceArmed = false
    let graceTimer: ReturnType<typeof setTimeout> | undefined

    source.onopen = () => {
      setStatus('online')
      if (!graceArmed) {
        graceArmed = true
        graceTimer = setTimeout(() => {
          readyForPlayback = true
        }, 700)
      }
    }
    source.onerror = () => {
      // EventSource retries automatically; reflect the dropout in the UI
      // while it does.
      setStatus(source.readyState === EventSource.CONNECTING ? 'connecting' : 'offline')
    }
    source.onmessage = (message) => {
      try {
        const event: LogVoiceEvent = JSON.parse(message.data)
        if (seenIds.current.has(event.id)) return
        seenIds.current.add(event.id)

        setEvents((prev) => [event, ...prev].slice(0, MAX_FEED_LENGTH))
        if (readyForPlayback) onEventRef.current(event)
      } catch {
        // Ignore malformed frames rather than tearing down the stream.
      }
    }

    return () => {
      clearTimeout(graceTimer)
      source.close()
    }
  }, [])

  return { events, status }
}
