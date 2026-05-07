import type { ImageContent } from '../types'

export function readImageAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowed = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
  if (!allowed.includes(file.type)) {
    return { valid: false, error: '仅支持 PNG、JPG、GIF、WebP 格式' }
  }
  if (file.size > 4 * 1024 * 1024) {
    return { valid: false, error: '图片大小不能超过 4MB' }
  }
  return { valid: true }
}

export function createImageContent(base64Url: string): ImageContent {
  return { type: 'image_url', image_url: { url: base64Url } }
}
