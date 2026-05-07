import { X } from 'lucide-react'

interface Props {
  src: string
  onRemove: () => void
}

export default function ImagePreview({ src, onRemove }: Props) {
  return (
    <div className="relative inline-block">
      <img
        src={src}
        alt="待发送图片"
        className="max-h-24 rounded-xl"
        style={{ border: '1px solid var(--border)' }}
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center transition"
        style={{ background: '#ef4444', color: '#fff' }}
      >
        <X size={10} strokeWidth={2} style={{ color: '#fff' }} />
      </button>
    </div>
  )
}
