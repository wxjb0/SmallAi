import { useState, useCallback } from 'react'
import type { Message, ContentBlock } from '../types'
import { getRoleById } from '../roles'
import { streamChat } from '../api'
import { readImageAsBase64, createImageContent } from '../utils/image'

interface UseSessionReturn {
  activeSession: {
    id: string
    roleId: string
    messages: Message[]
  } | undefined
  addMessage: (sessionId: string, message: Message) => void
  updateLastAssistantMessage: (sessionId: string, content: string) => void
}

export function useChat(session: UseSessionReturn) {
  const [loading, setLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')

  const sendMessage = useCallback(
    async (text: string, imageFile?: File) => {
      const active = session.activeSession
      if (!active || (!text.trim() && !imageFile)) return

      let content: string | ContentBlock[] = text

      if (imageFile) {
        const base64 = await readImageAsBase64(imageFile)
        content = [
          createImageContent(base64),
          { type: 'text' as const, text: text || '请描述这张图片' },
        ]
      }

      const userMessage: Message = { role: 'user', content, timestamp: Date.now() }
      session.addMessage(active.id, userMessage)

      setLoading(true)
      setStreamingContent('')

      try {
        const role = getRoleById(active.roleId)
        const messages = [...active.messages, userMessage]

        let aiContent = ''
        for await (const chunk of streamChat(messages, role.systemPrompt || undefined)) {
          aiContent += chunk
          setStreamingContent(aiContent)
        }

        const assistantMessage: Message = {
          role: 'assistant',
          content: aiContent,
          timestamp: Date.now(),
        }
        session.addMessage(active.id, assistantMessage)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '请求失败，请稍后重试'
        session.addMessage(active.id, {
          role: 'assistant',
          content: `❌ ${errorMessage}`,
          timestamp: Date.now(),
        })
      } finally {
        setLoading(false)
        setStreamingContent('')
      }
    },
    [session]
  )

  const clearCurrentSession = useCallback(() => {
    // This would be implemented if needed - currently we use deleteSession
  }, [])

  return { loading, streamingContent, sendMessage, clearCurrentSession }
}
