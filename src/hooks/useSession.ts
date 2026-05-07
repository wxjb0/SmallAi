import { useState, useCallback, useMemo } from 'react'
import type { Session, Message } from '../types'
import { loadStorage, saveStorage, generateId } from '../storage'

export function useSession() {
  const [data, setData] = useState(loadStorage)

  const activeSession = useMemo(
    () => data.sessions.find((s) => s.id === data.activeSessionId),
    [data.sessions, data.activeSessionId]
  )

  const persist = useCallback((sessions: Session[], activeSessionId: string | null) => {
    const next = { sessions, activeSessionId, version: 1 }
    setData(next)
    saveStorage(next)
  }, [])

  const createSession = useCallback(
    (roleId: string = 'default', title?: string) => {
      const session: Session = {
        id: generateId(),
        title: title ?? '新对话',
        roleId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      }
      persist([session, ...data.sessions], session.id)
      return session.id
    },
    [data.sessions, persist]
  )

  const deleteSession = useCallback(
    (id: string) => {
      const remaining = data.sessions.filter((s) => s.id !== id)
      const nextActiveId =
        data.activeSessionId === id
          ? remaining[0]?.id ?? null
          : data.activeSessionId
      persist(remaining, nextActiveId)
    },
    [data.sessions, data.activeSessionId, persist]
  )

  const switchSession = useCallback(
    (id: string) => {
      setData((prev) => ({ ...prev, activeSessionId: id }))
      saveStorage({ ...data, activeSessionId: id })
    },
    [data]
  )

  const updateSessionTitle = useCallback(
    (id: string, title: string) => {
      const sessions = data.sessions.map((s) =>
        s.id === id ? { ...s, title } : s
      )
      persist(sessions, data.activeSessionId)
    },
    [data.sessions, data.activeSessionId, persist]
  )

  const addMessage = useCallback(
    (sessionId: string, message: Message) => {
      const sessions = data.sessions.map((s) => {
        if (s.id !== sessionId) return s
        let title = s.title
        if (s.messages.length === 0 && message.role === 'user') {
          title = typeof message.content === 'string'
            ? message.content.slice(0, 20) || '新对话'
            : message.content.find((b) => b.type === 'text')?.text?.slice(0, 20) ?? '[图片]'
        }
        return {
          ...s,
          title,
          updatedAt: Date.now(),
          messages: [...s.messages, message],
        }
      })
      persist(sessions, data.activeSessionId)
    },
    [data.sessions, data.activeSessionId, persist]
  )

  const updateLastAssistantMessage = useCallback(
    (sessionId: string, content: string) => {
      setData((prev) => ({
        ...prev,
        sessions: prev.sessions.map((s) => {
          if (s.id !== sessionId) return s
          const messages = [...s.messages]
          const last = messages[messages.length - 1]
          if (last && last.role === 'assistant') {
            messages[messages.length - 1] = { ...last, content }
          }
          return { ...s, messages }
        }),
      }))
    },
    []
  )

  return {
    sessions: data.sessions,
    activeSessionId: data.activeSessionId,
    activeSession,
    createSession,
    deleteSession,
    switchSession,
    updateSessionTitle,
    addMessage,
    updateLastAssistantMessage,
  }
}
