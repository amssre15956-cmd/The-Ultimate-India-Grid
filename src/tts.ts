import { LANG_CODES, type Language } from './translations'

class TextToSpeechService {
  private synth: SpeechSynthesis | null = null
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private speaking = false

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis
    }
  }

  isSupported(): boolean {
    return this.synth !== null
  }

  isSpeaking(): boolean {
    return this.speaking && (this.synth?.speaking ?? false)
  }

  stop() {
    if (!this.synth) return
    this.speaking = false
    this.synth.cancel()
    this.currentUtterance = null
  }

  speak(text: string, lang: Language, onStart?: () => void, onEnd?: () => void) {
    if (!this.synth) return

    // Stop any existing utterance first
    this.stop()

    const cleanText = text.replace(/[*#`_]/g, '').trim()
    if (!cleanText) return

    const utterance = new SpeechSynthesisUtterance(cleanText)
    const targetLangCode = LANG_CODES[lang] || 'en-IN'
    utterance.lang = targetLangCode
    utterance.rate = 0.95
    utterance.pitch = 1.0

    // Attempt to pick a matching voice if voices are loaded
    const voices = this.synth.getVoices()
    if (voices.length > 0) {
      const prefix = targetLangCode.split('-')[0]
      const match =
        voices.find((v) => v.lang.toLowerCase() === targetLangCode.toLowerCase()) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(prefix.toLowerCase())) ||
        voices.find((v) => v.lang.toLowerCase().includes('in'))
      if (match) utterance.voice = match
    }

    utterance.onstart = () => {
      this.speaking = true
      onStart?.()
    }

    utterance.onend = () => {
      this.speaking = false
      this.currentUtterance = null
      onEnd?.()
    }

    utterance.onerror = () => {
      this.speaking = false
      this.currentUtterance = null
      onEnd?.()
    }

    this.currentUtterance = utterance
    this.synth.speak(utterance)
  }
}

export const ttsService = new TextToSpeechService()
