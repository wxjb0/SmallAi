import type { Session, ExportFormat } from '../types'

function getMessageText(content: Session['messages'][0]['content']): string {
  if (typeof content === 'string') return content
  return content
    .map((b) => {
      if (b.type === 'text') return b.text
      if (b.type === 'image_url') return '[图片]'
      return ''
    })
    .join('')
}

export function exportAsJSON(session: Session): string {
  return JSON.stringify(
    {
      title: session.title,
      roleId: session.roleId,
      createdAt: new Date(session.createdAt).toISOString(),
      messages: session.messages.map(({ role, content, timestamp }) => ({
        role,
        content: getMessageText(content),
        time: new Date(timestamp).toISOString(),
      })),
    },
    null,
    2
  )
}

export function exportAsMarkdown(session: Session): string {
  const lines = [
    `# ${session.title}`,
    `> 创建时间: ${new Date(session.createdAt).toLocaleString()}`,
    '',
    '---',
    '',
  ]

  for (const msg of session.messages) {
    const label = msg.role === 'user' ? '**用户**' : '**AI**'
    lines.push(`${label}: ${getMessageText(msg.content)}`, '')
  }

  return lines.join('\n')
}

export function exportAsText(session: Session): string {
  const lines = [
    session.title,
    `创建时间: ${new Date(session.createdAt).toLocaleString()}`,
    '='.repeat(40),
    '',
  ]

  for (const msg of session.messages) {
    const label = msg.role === 'user' ? '用户' : 'AI'
    lines.push(`[${label}]: ${getMessageText(msg.content)}`, '')
  }

  return lines.join('\n')
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function generateFilename(sessionTitle: string, format: ExportFormat): string {
  const safe = sessionTitle.replace(/[^a-zA-Z0-9一-龥]/g, '_').slice(0, 50)
  const date = new Date().toISOString().slice(0, 10)
  const ext = { json: 'json', markdown: 'md', text: 'txt' }[format]
  return `${safe}_${date}.${ext}`
}

export function exportSession(session: Session, format: ExportFormat): void {
  const exporters = {
    json: { fn: exportAsJSON, mime: 'application/json' },
    markdown: { fn: exportAsMarkdown, mime: 'text/markdown' },
    text: { fn: exportAsText, mime: 'text/plain' },
  }
  const { fn, mime } = exporters[format]
  const content = fn(session)
  const filename = generateFilename(session.title, format)
  downloadFile(content, filename, mime)
}
