import type { Session } from '../types'
import { ROLE_ICONS, ROLE_COLORS } from '../roles'
import { Hexagon, Plus, X } from 'lucide-react'

interface Props {
  sessions: Session[]
  activeSessionId: string | null
  onSwitch: (id: string) => void
  onDelete: (id: string) => void
  onNewChat: () => void
}

export default function SessionSidebar({
  sessions,
  activeSessionId,
  onSwitch,
  onDelete,
  onNewChat,
}: Props) {
  return (
    <aside
      className="w-64 flex flex-col shrink-0 h-full"
      style={{ background: '#0a0a0a', color: '#d1d5db' }}
    >
      {/* Logo */}
      <div className="px-5 py-4 flex items-center gap-2.5" style={{ borderBottom: '1px solid #1f1f1f' }}>
        <Hexagon size={22} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
        <span className="font-semibold text-base" style={{ color: '#fff', letterSpacing: '-0.02em' }}>Nexus AI</span>
      </div>

      {/* New Chat */}
      <div className="p-3" style={{ borderBottom: '1px solid #1f1f1f' }}>
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition"
          style={{ background: '#1a1a1a', color: '#9ca3af' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#262626'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#9ca3af' }}
        >
          <Plus size={16} strokeWidth={1.5} />
          新建对话
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {sessions.length === 0 && (
          <div className="px-4 py-8 text-center text-sm" style={{ color: '#4b5563' }}>
            暂无对话
          </div>
        )}
        {sessions.map((session) => {
          const Icon = ROLE_ICONS[session.roleId]
          const color = ROLE_COLORS[session.roleId]
          const lastMsg = session.messages[session.messages.length - 1]
          const preview =
            lastMsg
              ? (typeof lastMsg.content === 'string'
                  ? lastMsg.content
                  : lastMsg.content.find((b) => b.type === 'text')?.text ?? '[图片]'
                ).slice(0, 30)
              : '空对话'

          const isActive = session.id === activeSessionId

          return (
            <div
              key={session.id}
              onClick={() => onSwitch(session.id)}
              className="group px-3 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-2.5 mb-0.5"
              style={{
                background: isActive ? '#1a1a1a' : 'transparent',
                color: isActive ? '#fff' : '#9ca3af',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#141414' }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${color}18`, color }}
              >
                {Icon && <Icon size={14} strokeWidth={1.5} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{session.title}</div>
                <div className="text-xs truncate" style={{ color: '#4b5563' }}>{preview}</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm('确定删除该对话？')) onDelete(session.id)
                }}
                className="opacity-0 group-hover:opacity-100 transition shrink-0 p-1 rounded"
                style={{ color: '#4b5563' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#4b5563' }}
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
