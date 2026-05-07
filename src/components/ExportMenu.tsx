import { useState } from 'react'
import { Download, Code, FileText, File } from 'lucide-react'
import type { Session, ExportFormat } from '../types'
import { exportSession } from '../utils/export'

interface Props {
  session: Session
}

export default function ExportMenu({ session }: Props) {
  const [open, setOpen] = useState(false)

  const handleExport = (format: ExportFormat) => {
    exportSession(session, format)
    setOpen(false)
  }

  const items: { format: ExportFormat; label: string; icon: React.ReactNode }[] = [
    { format: 'json', label: 'JSON 格式', icon: <Code size={14} strokeWidth={1.5} /> },
    { format: 'markdown', label: 'Markdown 格式', icon: <FileText size={14} strokeWidth={1.5} /> },
    { format: 'text', label: '纯文本格式', icon: <File size={14} strokeWidth={1.5} /> },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        title="导出对话"
        className="p-1.5 rounded-lg transition flex items-center"
        style={{ color: 'var(--text-ter)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-sec)'; e.currentTarget.style.background = 'var(--border-lt)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-ter)'; e.currentTarget.style.background = 'transparent' }}
      >
        <Download size={16} strokeWidth={1.5} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1.5 z-50 py-1.5 w-44"
            style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-lt)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08)' }}
          >
            {items.map((item) => (
              <button
                key={item.format}
                onClick={() => handleExport(item.format)}
                className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition"
                style={{ color: 'var(--text-sec)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border-lt)'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-sec)' }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
