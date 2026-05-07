import { useState } from 'react'
import { useSession } from '../hooks/useSession'
import { useChat } from '../hooks/useChat'
import { getRoleById, ROLE_ICONS, ROLE_COLORS } from '../roles'
import { Menu, Trash2 } from 'lucide-react'
import SessionSidebar from './SessionSidebar'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import RoleSelector from './RoleSelector'
import ExportMenu from './ExportMenu'

export default function ChatInterface() {
  const session = useSession()
  const chat = useChat(session)
  const [showRoleSelector, setShowRoleSelector] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleNewChat = () => {
    setShowRoleSelector(true)
  }

  const handleRoleSelect = (roleId: string) => {
    session.createSession(roleId)
    setShowRoleSelector(false)
  }

  const activeRole = session.activeSession
    ? getRoleById(session.activeSession.roleId)
    : null

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative z-40 h-full transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <SessionSidebar
          sessions={session.sessions}
          activeSessionId={session.activeSessionId}
          onSwitch={(id) => { session.switchSession(id); setSidebarOpen(false) }}
          onDelete={session.deleteSession}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <header
          className="px-5 py-3.5 flex items-center gap-3 shrink-0"
          style={{
            background: 'rgba(250,250,250,0.85)',
            backdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid var(--border-lt)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg transition"
            style={{ color: 'var(--text-sec)' }}
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>

          <div className="flex-1 min-w-0 flex items-center gap-2.5">
            {activeRole && session.activeSession && (() => {
              const Icon = ROLE_ICONS[session.activeSession!.roleId]
              const color = ROLE_COLORS[session.activeSession!.roleId]
              return Icon ? (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}12`, color }}
                >
                  <Icon size={18} strokeWidth={1.5} />
                </div>
              ) : null
            })()}
            <span className="font-semibold text-base truncate" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>
              {activeRole ? activeRole.name : 'AI 聊天助手'}
            </span>
          </div>

          {session.activeSession && session.activeSession.messages.length > 0 && (
            <div className="flex items-center gap-2">
              <ExportMenu session={session.activeSession} />
              <button
                onClick={() => {
                  if (confirm('确定清空当前对话？')) {
                    session.deleteSession(session.activeSessionId!)
                    session.createSession()
                  }
                }}
                className="p-1.5 rounded-lg transition"
                style={{ color: 'var(--text-ter)' }}
              >
                <Trash2 size={16} strokeWidth={1.5} />
              </button>
            </div>
          )}
        </header>

        <MessageList
          messages={session.activeSession?.messages ?? []}
          streamingContent={chat.streamingContent}
          loading={chat.loading}
        />

        <MessageInput loading={chat.loading} onSend={chat.sendMessage} />
      </div>

      {showRoleSelector && (
        <RoleSelector
          selectedRoleId="default"
          onSelect={handleRoleSelect}
          onClose={() => setShowRoleSelector(false)}
        />
      )}
    </div>
  )
}
