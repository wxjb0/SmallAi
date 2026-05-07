import type { Message } from './types'

const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
const ASR_URL = 'https://open.bigmodel.cn/api/paas/v4/audio/transcriptions'

export async function* streamChat(
  messages: Message[],
  systemPrompt?: string
): AsyncGenerator<string, void, unknown> {
  const apiKey = import.meta.env.VITE_ZHIPU_API_KEY

  if (!apiKey) {
    throw new Error('请在 .env 文件中配置 VITE_ZHIPU_API_KEY')
  }

  const apiMessages = [
    ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
    ...messages.map(({ role, content }) => ({
      role,
      content: typeof content === 'string' ? content : content,
    })),
  ]

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'glm-4-flash',
      messages: apiMessages,
      stream: true,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API 调用失败: ${response.status} ${error}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()!

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6)
      if (data === '[DONE]') return

      try {
        const parsed = JSON.parse(data)
        const content = parsed.choices?.[0]?.delta?.content
        if (content) yield content
      } catch {
        // skip malformed JSON lines
      }
    }
  }
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const apiKey = import.meta.env.VITE_ZHIPU_API_KEY

  if (!apiKey) {
    throw new Error('请在 .env 文件中配置 VITE_ZHIPU_API_KEY')
  }

  const formData = new FormData()
  formData.append('file', new File([audioBlob], 'audio.wav', { type: 'audio/wav' }))
  formData.append('model', 'glm-asr-2512')

  const response = await fetch(ASR_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`语音识别失败: ${response.status} ${error}`)
  }

  const result = await response.json()
  return result.text ?? ''
}
