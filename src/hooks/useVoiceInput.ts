import { useState, useCallback, useRef, useEffect } from 'react'
import type { VoiceState } from '../types'
import { createVoiceRecorder } from '../utils/voice'

export function useVoiceInput(onTranscript: (text: string) => void) {
  const [state, setState] = useState<VoiceState>('idle')
  const [error, setError] = useState<string | null>(null)
  const recorderRef = useRef<ReturnType<typeof createVoiceRecorder> | null>(null)

  const isSupported = typeof navigator !== 'undefined'
    && !!navigator.mediaDevices?.getUserMedia
    && typeof MediaRecorder !== 'undefined'

  useEffect(() => {
    return () => { recorderRef.current?.abort() }
  }, [])

  const startListening = useCallback(async () => {
    setError(null)

    if (!recorderRef.current) {
      recorderRef.current = createVoiceRecorder()
    }

    try {
      await recorderRef.current.startRecording()
      setState('listening')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '录音启动失败'
      if (msg.includes('Permission') || msg.includes('denied') || msg.includes('NotAllowed')) {
        setError('无法访问麦克风，请检查浏览器权限设置')
      } else {
        setError(msg)
      }
      setState('idle')
    }
  }, [])

  const stopListening = useCallback(async () => {
    if (!recorderRef.current) return

    setState('processing')

    try {
      const text = await recorderRef.current.stopRecording()
      if (text) {
        onTranscript(text)
      }
      setState('idle')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '语音识别失败'
      setError(msg)
      setState('idle')
      setTimeout(() => setError(null), 3000)
    }
  }, [onTranscript])

  const toggleListening = useCallback(() => {
    if (state === 'listening') stopListening()
    else if (state === 'idle') startListening()
  }, [state, startListening, stopListening])

  return { state, error, isSupported, startListening, stopListening, toggleListening }
}
