import { useState, useCallback, useRef, useEffect } from 'react'
import type { VoiceState } from '../types'
import { createSpeechRecognizer } from '../utils/voice'

export function useVoiceInput(onTranscript: (text: string) => void) {
  const [state, setState] = useState<VoiceState>('idle')
  const [error, setError] = useState<string | null>(null)
  const recognizerRef = useRef<ReturnType<typeof createSpeechRecognizer>>(null)

  const isSupported = typeof window !== 'undefined' && !!(window.SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition)

  useEffect(() => {
    return () => { recognizerRef.current?.abort() }
  }, [])

  const startListening = useCallback(() => {
    setError(null)

    recognizerRef.current = createSpeechRecognizer(
      (transcript, isFinal) => {
        if (isFinal) onTranscript(transcript)
      },
      (err) => {
        setError(err)
        setState('idle')
      },
      () => { setState('idle') }
    )

    if (!recognizerRef.current) {
      setError('浏览器不支持语音识别')
      return
    }

    recognizerRef.current.start()
    setState('listening')
  }, [onTranscript])

  const stopListening = useCallback(() => {
    recognizerRef.current?.stop()
    setState('idle')
  }, [])

  const toggleListening = useCallback(() => {
    if (state === 'listening') stopListening()
    else startListening()
  }, [state, startListening, stopListening])

  return { state, error, isSupported, startListening, stopListening, toggleListening }
}
