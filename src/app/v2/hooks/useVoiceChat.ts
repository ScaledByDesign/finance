'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export interface VoiceSettings {
  rate: number
  pitch: number
  volume: number
  voice?: SpeechSynthesisVoice
}

export interface SpeechSettings {
  continuous: boolean
  interimResults: boolean
  language: string
  maxAlternatives: number
}

export interface VoiceChatState {
  isListening: boolean
  isSpeaking: boolean
  isPaused: boolean
  isProcessing: boolean
  currentTranscript: string
  error: string | null
  isSupported: boolean
}

export interface VoiceChatActions {
  startListening: () => void
  stopListening: () => void
  speak: (text: string) => void
  stopSpeaking: () => void
  pauseSpeaking: () => void
  resumeSpeaking: () => void
  sendMessage: (message: string) => void
  clearMessages: () => void
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void
  updateSpeechSettings: (settings: Partial<SpeechSettings>) => void
  checkMicrophonePermission: () => Promise<boolean>
}

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  rate: 0.9,
  pitch: 1.0,
  volume: 0.8,
}

const DEFAULT_SPEECH_SETTINGS: SpeechSettings = {
  continuous: false,
  interimResults: true,
  language: 'en-US',
  maxAlternatives: 1,
}

export function useVoiceChat() {
  // Voice chat state
  const [state, setState] = useState<VoiceChatState>({
    isListening: false,
    isSpeaking: false,
    isPaused: false,
    isProcessing: false,
    currentTranscript: '',
    error: null,
    isSupported: false,
  })

  // Settings
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS)
  const [speechSettings, setSpeechSettings] = useState<SpeechSettings>(DEFAULT_SPEECH_SETTINGS)

  // Refs for speech APIs
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize speech recognition and synthesis
  useEffect(() => {
    const initializeSpeechAPIs = () => {
      // Check for speech recognition support
      if (typeof window !== 'undefined') {
        console.log('Initializing speech APIs...')
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

        if (SpeechRecognition) {
          console.log('Speech recognition supported, creating instance...')
          recognitionRef.current = new SpeechRecognition()
          const recognition = recognitionRef.current
          if (recognition) {
            recognition.continuous = speechSettings.continuous
            recognition.interimResults = speechSettings.interimResults
            recognition.lang = speechSettings.language
            ;(recognition as any).maxAlternatives = speechSettings.maxAlternatives
            console.log('Speech recognition configured:', {
              continuous: speechSettings.continuous,
              interimResults: speechSettings.interimResults,
              language: speechSettings.language
            })

            recognition.onstart = () => {
              setState(prev => ({ ...prev, isListening: true, error: null }))
            }

            recognition.onresult = (event) => {
              const transcript = Array.from(event.results as any)
                .map((result: any) => result[0])
                .map((result: any) => result.transcript)
                .join('')

              setState(prev => ({ ...prev, currentTranscript: transcript }))
            }

            recognition.onend = () => {
              setState(prev => ({ ...prev, isListening: false }))
            }

            recognition.onerror = (event: any) => {
              console.error('Speech recognition error:', event.error, event)
              let errorMessage = `Speech recognition error: ${event.error}`

              // Provide more helpful error messages
              switch (event.error) {
                case 'not-allowed':
                  errorMessage = 'Microphone access denied. Please allow microphone permissions and try again.'
                  break
                case 'no-speech':
                  errorMessage = 'No speech detected. Please try speaking again.'
                  break
                case 'audio-capture':
                  errorMessage = 'No microphone found. Please check your microphone connection.'
                  break
                case 'network':
                  errorMessage = 'Network error occurred. Please check your internet connection.'
                  break
                case 'service-not-allowed':
                  errorMessage = 'Speech recognition service not allowed. Please try again.'
                  break
                default:
                  errorMessage = `Speech recognition error: ${event.error}`
              }

              setState(prev => ({
                ...prev,
                isListening: false,
                error: errorMessage
              }))
            }
          }
        } else {
          console.warn('Speech recognition not supported in this browser')
        }

        // Initialize speech synthesis
        if (window.speechSynthesis) {
          synthRef.current = window.speechSynthesis
        }

        setState(prev => ({
          ...prev,
          isSupported: !!(SpeechRecognition && window.speechSynthesis)
        }))
      }
    }

    initializeSpeechAPIs()

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [speechSettings])

  // Speech recognition actions
  const startListening = useCallback(() => {
    if (recognitionRef.current && !state.isListening) {
      try {
        console.log('Attempting to start speech recognition...')
        recognitionRef.current.start()
      } catch (error) {
        console.error('Speech recognition start error:', error)
        setState(prev => ({ ...prev, error: `Failed to start listening: ${error}` }))
      }
    } else if (!recognitionRef.current) {
      console.error('Speech recognition not initialized')
      setState(prev => ({ ...prev, error: 'Speech recognition not supported or not initialized' }))
    } else if (state.isListening) {
      console.warn('Already listening')
    }
  }, [state.isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop()
    }
  }, [state.isListening])

  // Speech synthesis actions
  const speak = useCallback((text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = voiceSettings.rate
      utterance.pitch = voiceSettings.pitch
      utterance.volume = voiceSettings.volume
      
      if (voiceSettings.voice) {
        utterance.voice = voiceSettings.voice
      }

      utterance.onstart = () => {
        setState(prev => ({ ...prev, isSpeaking: true, isPaused: false }))
      }

      utterance.onend = () => {
        setState(prev => ({ ...prev, isSpeaking: false, isPaused: false }))
        currentUtteranceRef.current = null
      }

      utterance.onpause = () => {
        setState(prev => ({ ...prev, isPaused: true }))
      }

      utterance.onresume = () => {
        setState(prev => ({ ...prev, isPaused: false }))
      }

      utterance.onerror = () => {
        setState(prev => ({ ...prev, isSpeaking: false, isPaused: false, error: 'Speech synthesis error' }))
        currentUtteranceRef.current = null
      }

      currentUtteranceRef.current = utterance
      synthRef.current.speak(utterance)
    }
  }, [voiceSettings])

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setState(prev => ({ ...prev, isSpeaking: false, isPaused: false }))
      currentUtteranceRef.current = null
    }
  }, [])

  const pauseSpeaking = useCallback(() => {
    if (synthRef.current && state.isSpeaking) {
      if (state.isPaused) {
        synthRef.current.resume()
      } else {
        synthRef.current.pause()
      }
    }
  }, [state.isSpeaking, state.isPaused])

  const resumeSpeaking = useCallback(() => {
    if (synthRef.current && state.isPaused) {
      synthRef.current.resume()
    }
  }, [state.isPaused])

  // Message handling (removed since we're not using useChat hook)

  // Settings updates
  const updateVoiceSettings = useCallback((settings: Partial<VoiceSettings>) => {
    setVoiceSettings(prev => ({ ...prev, ...settings }))
  }, [])

  const updateSpeechSettings = useCallback((settings: Partial<SpeechSettings>) => {
    setSpeechSettings(prev => ({ ...prev, ...settings }))
  }, [])

  const checkMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      if (typeof window !== 'undefined' && navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        console.log('Microphone permission status:', permission.state)
        return permission.state === 'granted'
      }
      return false
    } catch (error) {
      console.error('Error checking microphone permission:', error)
      return false
    }
  }, [])

  const actions: VoiceChatActions = {
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    sendMessage: () => {}, // Not used in RSC approach
    clearMessages: () => {}, // Not used in RSC approach
    updateVoiceSettings,
    updateSpeechSettings,
    checkMicrophonePermission,
  }

  return {
    state,
    actions,
    voiceSettings,
    speechSettings,
  }
}
