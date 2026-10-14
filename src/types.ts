export type LogLevel = 'INFO' | 'WARN' | 'ERROR'

export interface LogVoiceEvent {
  id: string
  level: LogLevel
  service: string
  message: string
  spokenText: string
  audioUrl: string
  timestamp: string
}

export type ConnectionStatus = 'connecting' | 'online' | 'offline'
