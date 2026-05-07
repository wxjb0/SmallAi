import { useEffect, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Sparkles, User } from 'lucide-react'
import type { Message, ContentBlock } from '../types'

interface Props {
  messages: Message[]
  streamingContent?: string
  loading?: boolean
}

function getMessageText(content: Message['content']): string {
  if (typeof content === 'string') return content
  return content
    .map((b: ContentBlock) => (b.type === 'text' ? b.text : ''))
    .join('')
}

function getMessageImages(content: Message['content']): string[] {
  if (typeof content === 'string') return []
  return content
    .filter((b: ContentBlock) => b.type === 'image_url')
    .map((b: ContentBlock) => (b.type === 'image_url' ? b.image_url.url : ''))
}

function CopyButton({ text }: { text: string }) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 text-xs px-2.5 py-1.5 rounded-lg transition opacity-0 group-hover:opacity-100 flex items-center gap-1.5"
      style={{ background: '#1a1a1a', color: '#9ca3af' }}
      onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
      onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af' }}
    >
      <Copy size={12} strokeWidth={1.5} />
      复制
    </button>
  )
}

function MarkdownContent({ content, role }: { content: string; role: string }) {
  return (
    <ReactMarkdown
      components={{
        pre({ children }) {
          return <>{children}</>
        },
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          if (match) {
            return (
              <div className="relative group" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                <CopyButton text={String(children).replace(/\n$/, '')} />
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  className="text-sm"
                  customStyle={{ margin: 0, borderRadius: '10px', fontSize: '0.8125rem' }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            )
          }
          return (
            <code
              className="text-sm"
              style={{
                padding: '0.125rem 0.375rem',
                borderRadius: '4px',
                background: role === 'user' ? 'rgba(255,255,255,0.2)' : 'var(--border-lt)',
                color: role === 'user' ? '#fff' : '#e11d48',
              }}
              {...props}
            >
              {children}
            </code>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

/* ── Empty state: Aurora glassmorphism ── */
function EmptyState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ zIndex: 2 }}>
      <div className="aurora-blob aurora-1" />
      <div className="aurora-blob aurora-2" />
      <div className="aurora-blob aurora-3" />
      <div className="empty-grid" />
      <div className="empty-card">
        <div className="empty-ring" />
        <div className="empty-icon-wrap">
          <Sparkles size={32} strokeWidth={1.2} style={{ color: '#6366f1' }} />
        </div>
        <h2 className="empty-title">Nexus AI</h2>
        <p className="empty-subtitle">探索无限可能</p>
        <div className="empty-pills">
          <span className="empty-pill">编程</span>
          <span className="empty-pill">写作</span>
          <span className="empty-pill">翻译</span>
          <span className="empty-pill">心理咨询</span>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const text = getMessageText(msg.content)
  const images = getMessageImages(msg.content)

  return (
    <div className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {msg.role === 'assistant' && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent)' }}
        >
          <Sparkles size={16} strokeWidth={1.5} style={{ color: '#fff' }} />
        </div>
      )}

      <div
        className="relative group max-w-[80%] px-4 py-3"
        style={{
          borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          background: msg.role === 'user' ? 'var(--text)' : 'var(--bg-card)',
          color: msg.role === 'user' ? '#fff' : 'var(--text)',
          boxShadow: msg.role === 'user' ? 'none' : '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          border: msg.role === 'user' ? 'none' : '1px solid var(--border-lt)',
        }}
      >
        {msg.role === 'assistant' && !text.startsWith('❌') && (
          <button
            onClick={() => navigator.clipboard.writeText(text)}
            className="absolute -top-2.5 -right-2.5 p-1.5 rounded-lg transition opacity-0 group-hover:opacity-100"
            style={{ background: 'var(--bg-card)', color: 'var(--text-ter)', border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-ter)' }}
          >
            <Copy size={12} strokeWidth={1.5} />
          </button>
        )}

        {images.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {images.map((src, i) => (
              <img key={i} src={src} alt="用户图片" className="max-h-40 rounded-xl" style={{ border: '1px solid var(--border-lt)' }} />
            ))}
          </div>
        )}

        <MarkdownContent content={text} role={msg.role} />
      </div>

      {msg.role === 'user' && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'var(--border)', color: 'var(--text-sec)' }}
        >
          <User size={16} strokeWidth={1.5} />
        </div>
      )}
    </div>
  )
}

export default function MessageList({ messages, streamingContent, loading }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const isAtBottom = useRef(true)
  const prevCount = useRef(messages.length)

  // Check if user is scrolled to the bottom (within 150px)
  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    isAtBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 150
  }, [])

  // Scroll to absolute bottom, instantly
  const jumpToBottom = useCallback(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  // New user message → always scroll to bottom (smooth)
  useEffect(() => {
    if (messages.length > prevCount.current) {
      const last = messages[messages.length - 1]
      if (last?.role === 'user') {
        isAtBottom.current = true
        const el = scrollRef.current
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      }
    }
    prevCount.current = messages.length
  }, [messages])

  // Streaming content → only auto-scroll if user hasn't scrolled up
  useEffect(() => {
    if (streamingContent && isAtBottom.current) {
      jumpToBottom()
    }
  }, [streamingContent, jumpToBottom])

  return (
    <div className="flex-1 relative overflow-hidden chat-bg">
      {/* Background orbs */}
      <div className="mesh-orb mesh-orb-1" />
      <div className="mesh-orb mesh-orb-2" />
      <div className="mesh-orb mesh-orb-3" />

      {/* Empty state */}
      {!messages.length && !loading && <EmptyState />}

      {/* Scrollable message area */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="relative flex-1 overflow-y-auto px-4 md:px-6 py-6"
        style={{ zIndex: 1 }}
      >
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map((msg) => (
            <MessageBubble key={msg.timestamp} msg={msg} />
          ))}

          {loading && streamingContent && (
            <div className="flex items-end gap-3 justify-start">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--accent)' }}>
                <Sparkles size={16} strokeWidth={1.5} style={{ color: '#fff' }} />
              </div>
              <div
                className="max-w-[80%] px-4 py-3"
                style={{ borderRadius: '16px 16px 16px 4px', background: 'var(--bg-card)', color: 'var(--text)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid var(--border-lt)' }}
              >
                <MarkdownContent content={streamingContent} role="assistant" />
              </div>
            </div>
          )}

          {loading && !streamingContent && (
            <div className="flex items-end gap-3 justify-start">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--accent)' }}>
                <Sparkles size={16} strokeWidth={1.5} style={{ color: '#fff' }} />
              </div>
              <div
                className="px-4 py-3 text-sm flex items-center gap-2"
                style={{ borderRadius: '16px 16px 16px 4px', background: 'var(--bg-card)', color: 'var(--text-ter)', border: '1px solid var(--border-lt)' }}
              >
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-ter)', animationDelay: '-0.3s' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-ter)', animationDelay: '-0.15s' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-ter)' }} />
                </span>
                思考中...
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>
    </div>
  )
}
