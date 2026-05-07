import { Mic } from 'lucide-react'

interface Props {
  isListening: boolean
  isSupported: boolean
  onToggle: () => void
}

export default function VoiceButton({ isListening, isSupported, onToggle }: Props) {
  if (!isSupported) return null

  return (
    <button
      type="button"
      onClick={onToggle}
      title={isListening ? '停止录音' : '语音输入'}
      className="p-2.5 rounded-xl transition flex items-center justify-center"
      style={{
        color: isListening ? '#ef4444' : 'var(--text-ter)',
        background: isListening ? '#fef2f2' : 'transparent',
        animation: isListening ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
      }}
      onMouseEnter={(e) => { if (!isListening) { e.currentTarget.style.color = 'var(--text-sec)'; e.currentTarget.style.background = 'var(--border-lt)' } }}
      onMouseLeave={(e) => { if (!isListening) { e.currentTarget.style.color = 'var(--text-ter)'; e.currentTarget.style.background = 'transparent' } }}
    >
      <Mic size={20} strokeWidth={1.5} />
    </button>
  )
}
