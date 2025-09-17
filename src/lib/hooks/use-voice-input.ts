'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface VoiceInputState {
  isListening: boolean
  isSpeaking: boolean
  isSupported: boolean
  transcript: string
  error: string | null
}

export function useVoiceInput() {
  const [state, setState] = useState<VoiceInputState>({
    isListening: false,
    isSpeaking: false,
    isSupported: false,
    transcript: '',
    error: null
  })

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize speech APIs
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const speechSynthesis = window.speechSynthesis

    if (!SpeechRecognition || !speechSynthesis) {
      setState(prev => ({
        ...prev,
        isSupported: false,
        error: 'Speech recognition or synthesis not supported in this browser'
      }))
      return
    }

    // Initialize recognition
    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null, transcript: '' }))
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        const combinedTranscript = finalTranscript || interimTranscript
        setState(prev => ({ ...prev, transcript: combinedTranscript.trim() }))
      }

      recognition.onerror = (event: any) => {
        let errorMessage = 'Speech recognition error'

        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.'
            break
          case 'audio-capture':
            errorMessage = 'Microphone not found or not accessible.'
            break
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.'
            break
          case 'network':
            errorMessage = 'Network error. Please check your connection.'
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

      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }))
      }

      recognitionRef.current = recognition
      synthRef.current = speechSynthesis

      setState(prev => ({ ...prev, isSupported: true }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSupported: false,
        error: 'Failed to initialize speech recognition'
      }))
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
      if (synthRef.current && utteranceRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  const startListening = useCallback(async () => {
    if (!recognitionRef.current || state.isListening) return

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true })

      // Start recognition
      recognitionRef.current.start()
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to start listening'
      }))
    }
  }, [state.isListening])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !state.isListening) return

    try {
      recognitionRef.current.stop()
    } catch (error) {
      // Ignore stop errors
    }
  }, [state.isListening])

  const speak = useCallback((text: string) => {
    if (!synthRef.current || !text) return

    // Cancel any ongoing speech
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 0.8
    utterance.lang = 'en-US'

    // Select a natural-sounding voice if available
    const voices = synthRef.current.getVoices()
    const preferredVoice = voices.find(voice =>
      voice.name.includes('Google') ||
      voice.name.includes('Microsoft') ||
      voice.name.includes('Natural')
    )
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.onstart = () => {
      setState(prev => ({ ...prev, isSpeaking: true }))
    }

    utterance.onend = () => {
      setState(prev => ({ ...prev, isSpeaking: false }))
      utteranceRef.current = null
    }

    utterance.onerror = () => {
      setState(prev => ({
        ...prev,
        isSpeaking: false,
        error: 'Speech synthesis error'
      }))
      utteranceRef.current = null
    }

    utteranceRef.current = utterance
    synthRef.current.speak(utterance)
  }, [])

  const stopSpeaking = useCallback(() => {
    if (!synthRef.current) return

    synthRef.current.cancel()
    setState(prev => ({ ...prev, isSpeaking: false }))
    utteranceRef.current = null
  }, [])

  return {
    isListening: state.isListening,
    isSpeaking: state.isSpeaking,
    isSupported: state.isSupported,
    transcript: state.transcript,
    error: state.error,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  }
}
