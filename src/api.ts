import type { LogLevel, LogVoiceEvent } from './types'

// Empty by default: the Vite dev server proxies /api to the backend, and a
// production build can be served behind the same reverse proxy. Set
// VITE_API_BASE_URL to point at a differently-hosted backend instead.
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export function streamUrl(): string {
  return `${API_BASE}/api/log-events/stream`
}

export function audioUrl(event: LogVoiceEvent): string {
  return event.audioUrl.startsWith('http') ? event.audioUrl : `${API_BASE}${event.audioUrl}`
}

export async function submitLogEvent(input: {
  level: LogLevel
  service: string
  message: string
}): Promise<LogVoiceEvent> {
  const res = await fetch(`${API_BASE}/api/log-events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Transmission failed (${res.status}): ${detail || res.statusText}`)
  }

  return res.json()
}
