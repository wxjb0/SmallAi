import { transcribeAudio } from '../api'

export interface VoiceRecorder {
  startRecording: () => Promise<void>
  stopRecording: () => Promise<string>
  abort: () => void
  isSupported: boolean
}

function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ]
  for (const type of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }
  return ''
}

async function convertToWav(blob: Blob): Promise<Blob> {
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const audioContext = new AudioContextClass()

  try {
    await audioContext.resume()

    const arrayBuffer = await blob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    const numChannels = 1
    const sampleRate = audioBuffer.sampleRate
    const length = audioBuffer.length
    const bytesPerSample = 2
    const dataSize = length * numChannels * bytesPerSample
    const buffer = new ArrayBuffer(44 + dataSize)
    const view = new DataView(buffer)

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, 36 + dataSize, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true)
    view.setUint16(32, numChannels * bytesPerSample, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, dataSize, true)

    const channelData = audioBuffer.getChannelData(0)
    let offset = 44
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]))
      view.setInt16(offset, sample * 0x7FFF, true)
      offset += 2
    }

    return new Blob([buffer], { type: 'audio/wav' })
  } finally {
    await audioContext.close()
  }
}

export function createVoiceRecorder(): VoiceRecorder {
  const supported = typeof navigator !== 'undefined'
    && !!navigator.mediaDevices?.getUserMedia
    && typeof MediaRecorder !== 'undefined'

  let mediaRecorder: MediaRecorder | null = null
  let mediaStream: MediaStream | null = null
  let chunks: Blob[] = []
  let autoStopTimer: ReturnType<typeof setTimeout> | null = null
  let abortFlag = false

  const cleanup = () => {
    if (autoStopTimer) {
      clearTimeout(autoStopTimer)
      autoStopTimer = null
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop())
      mediaStream = null
    }
    mediaRecorder = null
    chunks = []
  }

  return {
    isSupported: supported,

    async startRecording() {
      if (!supported) throw new Error('浏览器不支持录音功能')

      abortFlag = false
      chunks = []

      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mimeType = getSupportedMimeType()
      mediaRecorder = mimeType
        ? new MediaRecorder(mediaStream, { mimeType })
        : new MediaRecorder(mediaStream)

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      mediaRecorder.start()

      autoStopTimer = setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop()
        }
      }, 30000)
    },

    stopRecording(): Promise<string> {
      return new Promise((resolve, reject) => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
          cleanup()
          reject(new Error('未在录音中'))
          return
        }

        mediaRecorder.onstop = async () => {
          try {
            if (abortFlag) {
              cleanup()
              resolve('')
              return
            }

            console.log('[Voice] chunks count:', chunks.length)
            const webmBlob = new Blob(chunks, { type: mediaRecorder!.mimeType })
            console.log('[Voice] webmBlob size:', webmBlob.size, 'type:', webmBlob.type)
            cleanup()

            if (webmBlob.size === 0) {
              reject(new Error('未录制到音频，请重试'))
              return
            }

            const wavBlob = await convertToWav(webmBlob)
            console.log('[Voice] wavBlob size:', wavBlob.size, 'type:', wavBlob.type)
            const text = await transcribeAudio(wavBlob)
            resolve(text)
          } catch (err) {
            cleanup()
            reject(err instanceof Error ? err : new Error('语音识别失败'))
          }
        }

        mediaRecorder.stop()
      })
    },

    abort() {
      abortFlag = true
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop()
      }
      cleanup()
    },
  }
}
