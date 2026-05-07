interface SpeechRecognizer {
  start: () => void
  stop: () => void
  abort: () => void
}

export function createSpeechRecognizer(
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (error: string) => void,
  onEnd: () => void
): SpeechRecognizer | null {
  const win = window as unknown as Record<string, unknown>
  const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition

  if (!SpeechRecognition) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognition = new (SpeechRecognition as any)()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'zh-CN'

  recognition.onresult = (event: any) => {
    let interimTranscript = ''
    let finalTranscript = ''

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalTranscript += transcript
      } else {
        interimTranscript += transcript
      }
    }

    if (finalTranscript) onResult(finalTranscript, true)
    if (interimTranscript) onResult(interimTranscript, false)
  }

  recognition.onerror = (event: any) => {
    if (event.error !== 'aborted') {
      onError(event.error === 'no-speech' ? '未检测到语音' : `语音识别错误: ${event.error}`)
    }
  }

  recognition.onend = onEnd

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
    abort: () => recognition.abort(),
  }
}
