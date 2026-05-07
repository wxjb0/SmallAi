import type { StorageData, Session, Message } from './types'

const STORAGE_KEY = 'smallai_sessions'
const LEGACY_KEY = 'chat_messages'
const CURRENT_VERSION = 1

export function generateId(): string {
  return crypto.randomUUID()
}

export function loadStorage(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data: StorageData = JSON.parse(raw)
      if (data.version === CURRENT_VERSION) return data
    }
  } catch {
    // corrupted data, fall through to migration
  }

  const migrated = migrateFromLegacy()
  if (migrated) {
    saveStorage(migrated)
    return migrated
  }

  return { sessions: [], activeSessionId: null, version: CURRENT_VERSION }
}

export function saveStorage(data: StorageData): void {
  try {
    const serialized = JSON.stringify(data)
    if (serialized.length > 4 * 1024 * 1024) {
      console.warn('存储数据接近 localStorage 上限，部分数据可能无法保存')
    }
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch (e) {
    console.error('保存数据失败:', e)
  }
}

function migrateFromLegacy(): StorageData | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return null

    const messages: Message[] = JSON.parse(raw)
    if (!Array.isArray(messages) || messages.length === 0) return null

    const session: Session = {
      id: generateId(),
      title: '历史对话',
      roleId: 'default',
      createdAt: messages[0]?.timestamp ?? Date.now(),
      updatedAt: messages[messages.length - 1]?.timestamp ?? Date.now(),
      messages,
    }

    localStorage.removeItem(LEGACY_KEY)
    return { sessions: [session], activeSessionId: session.id, version: CURRENT_VERSION }
  } catch {
    return null
  }
}
