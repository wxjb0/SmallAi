export type MessageRole = 'user' | 'assistant' | 'system'

export interface TextContent {
  type: 'text'
  text: string
}

export interface ImageContent {
  type: 'image_url'
  image_url: { url: string }
}

export type ContentBlock = TextContent | ImageContent

export interface Message {
  role: MessageRole
  content: string | ContentBlock[]
  timestamp: number
}

export interface Session {
  id: string
  title: string
  roleId: string
  createdAt: number
  updatedAt: number
  messages: Message[]
}

export interface RoleDefinition {
  id: string
  name: string
  description: string
  icon: string
  systemPrompt: string
}

export type ExportFormat = 'json' | 'markdown' | 'text'

export type VoiceState = 'idle' | 'listening' | 'processing' | 'error'

export interface StorageData {
  sessions: Session[]
  activeSessionId: string | null
  version: number
}
