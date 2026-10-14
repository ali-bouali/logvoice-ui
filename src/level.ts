import type { LogLevel } from './types'

export const LEVEL_STYLE: Record<LogLevel, { hex: string; label: string; text: string; border: string; bg: string }> = {
  INFO: { hex: '#00f0ff', label: 'INFO', text: 'text-primary', border: 'border-primary/40', bg: 'bg-primary/10' },
  WARN: { hex: '#ffb020', label: 'WARN', text: 'text-warn', border: 'border-warn/40', bg: 'bg-warn/10' },
  ERROR: { hex: '#ff3b5c', label: 'ERROR', text: 'text-danger', border: 'border-danger/40', bg: 'bg-danger/10' },
}

export function relativeTime(iso: string): string {
  const deltaMs = Date.now() - new Date(iso).getTime()
  const seconds = Math.max(0, Math.round(deltaMs / 1000))
  if (seconds < 5) return 'now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  return `${hours}h ago`
}
