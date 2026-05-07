import { useState, useRef } from 'react'
import { Image, Send, AlertCircle } from 'lucide-react'
import VoiceButton from './VoiceButton'
import ImagePreview from './ImagePreview'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { validateImageFile } from '../utils/image'

interface Props {
  loading: boolean
  onSend: (text: string, imageFile?: File) => void
}

export default function MessageInput({ loading, onSend }: Props) {
  const [input, setInput] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { state: voiceState, isSupported, toggleListening } = useVoiceInput((text) => {
    setInput((prev) => prev + text)
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text && !imageFile) return
    onSend(text, imageFile ?? undefined)
    setInput('')
    setImageFile(null)
    setImagePreview(null)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const { valid, error } = validateImageFile(file)
    if (!valid) {
      setImageError(error ?? '图片格式不支持')
      return
    }

    setImageError(null)
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageError(null)
  }

  return (
    <footer
      className="px-4 md:px-6 py-4"
      style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-lt)' }}
    >
      <div className="max-w-3xl mx-auto">
        {imageError && (
          <div className="mb-2 text-sm flex items-center gap-1.5" style={{ color: '#ef4444' }}>
            <AlertCircle size={14} strokeWidth={1.5} />
            {imageError}
          </div>
        )}
        {imagePreview && (
          <div className="mb-2">
            <ImagePreview src={imagePreview} onRemove={removeImage} />
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="上传图片"
            className="p-2.5 rounded-xl transition"
            style={{ color: 'var(--text-ter)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-sec)'; e.currentTarget.style.background = 'var(--border-lt)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-ter)'; e.currentTarget.style.background = 'transparent' }}
          >
            <Image size={20} strokeWidth={1.5} />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={loading ? 'AI 思考中...' : '输入你的问题...'}
            disabled={loading}
            className="flex-1 px-4 py-2.5 outline-none text-sm transition disabled:opacity-50"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              color: 'var(--text)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-lt)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
          />

          <VoiceButton
            isListening={voiceState === 'listening'}
            isSupported={isSupported}
            onToggle={toggleListening}
          />

          <button
            type="submit"
            disabled={loading || (!input.trim() && !imageFile)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'var(--text)',
              color: '#fff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
            onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = '#333'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)' } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--text)'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)' }}
          >
            <Send size={14} strokeWidth={1.5} style={{ color: '#fff' }} />
            发送
          </button>
        </form>
      </div>
    </footer>
  )
}
