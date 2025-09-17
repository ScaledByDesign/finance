'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { VOICE_PRESETS, MODELS } from '@/lib/elevenlabs'

export interface ElevenLabsTTSState {
  isLoading: boolean
  isPlaying: boolean
  isPaused: boolean
  error: string | null
  isConfigured: boolean
  charactersUsed: number
  currentAudio: HTMLAudioElement | null
}

export interface ElevenLabsTTSSettings {
  voice_preset: keyof typeof VOICE_PRESETS
  model_id: string
  voice_settings: {
    stability: number
    similarity_boost: number
    style: number
    use_speaker_boost: boolean
  }
  autoPlay: boolean
  volume: number
}

export interface ElevenLabsTTSActions {
  speak: (text: string) => Promise<void>
  stop: () => void
  pause: () => void
  resume: () => void
  updateSettings: (settings: Partial<ElevenLabsTTSSettings>) => void
  checkConfiguration: () => Promise<boolean>
}

const DEFAULT_SETTINGS: ElevenLabsTTSSettings = {
  voice_preset: 'professional_female',
  model_id: MODELS.turbo,
  voice_settings: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true,
  },
  autoPlay: true,
  volume: 0.8,
}

export function useElevenLabsTTS(initialSettings?: Partial<ElevenLabsTTSSettings>) {
  const [state, setState] = useState<ElevenLabsTTSState>({
    isLoading: false,
    isPlaying: false,
    isPaused: false,
    error: null,
    isConfigured: false,
    charactersUsed: 0,
    currentAudio: null,
  })

  const [settings, setSettings] = useState<ElevenLabsTTSSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Define checkConfiguration first to avoid temporal dead zone
  const checkConfiguration = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/v1/tts/elevenlabs')
      const data = await response.json()
      
      const isConfigured = data.status === 'configured'
      setState(prev => ({ ...prev, isConfigured }))
      
      return isConfigured
    } catch (error) {
      console.error('Failed to check Eleven Labs configuration:', error)
      setState(prev => ({ ...prev, isConfigured: false }))
      return false
    }
  }, [])

  const stop = useCallback(() => {
    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // Stop and cleanup audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0

      // Clean up blob URL if it exists
      if (audioRef.current.src && audioRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(audioRef.current.src)
      }

      audioRef.current = null
    }

    setState(prev => ({
      ...prev,
      isLoading: false,
      isPlaying: false,
      isPaused: false,
      currentAudio: null
    }))
  }, [])

  const speak = useCallback(async (text: string): Promise<void> => {
    if (!text.trim()) return

    // Stop any current audio
    stop()

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController()

      const response = await fetch('/api/v1/tts/elevenlabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice_preset: settings.voice_preset,
          model_id: settings.model_id,
          voice_settings: settings.voice_settings,
          stream: false,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate speech')
      }

      const data = await response.json()

      if (!data.success || !data.audio_base64) {
        throw new Error('Invalid response from TTS service')
      }

      // Convert base64 to blob URL
      let audioUrl: string
      try {
        const audioData = Uint8Array.from(atob(data.audio_base64), c => c.charCodeAt(0))
        const audioBlob = new Blob([audioData], { type: data.audio_type || 'audio/mpeg' })
        audioUrl = URL.createObjectURL(audioBlob)

        console.log('Audio blob created:', {
          size: audioBlob.size,
          type: audioBlob.type,
          url: audioUrl
        })
      } catch (blobError) {
        console.error('Failed to create audio blob:', blobError)
        throw new Error('Failed to process audio data')
      }

      // Create and configure audio element
      const audio = new Audio(audioUrl)
      audio.volume = settings.volume
      audioRef.current = audio

      // Set up audio event listeners
      audio.onloadstart = () => {
        setState(prev => ({ ...prev, isLoading: true }))
      }

      audio.oncanplay = () => {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          currentAudio: audio,
          charactersUsed: prev.charactersUsed + (data.characters_used || 0)
        }))

        if (settings.autoPlay) {
          audio.play()
        }
      }

      audio.onplay = () => {
        setState(prev => ({ ...prev, isPlaying: true, isPaused: false }))
      }

      audio.onpause = () => {
        setState(prev => ({ ...prev, isPlaying: false, isPaused: true }))
      }

      audio.onended = () => {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          isPaused: false,
          currentAudio: null
        }))

        // Clean up the blob URL
        URL.revokeObjectURL(audioUrl)
        audioRef.current = null
      }

      audio.onerror = (error) => {
        console.error('Audio playback error:', error)

        // Clean up the blob URL on error
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl)
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          isPlaying: false,
          error: 'Failed to play audio. Please try again.',
          currentAudio: null
        }))

        audioRef.current = null
      }

      // Load the audio
      audio.load()

    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was aborted, don't update state
        return
      }

      console.error('TTS error:', error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error.message || 'Failed to generate speech',
        currentAudio: null
      }))
    }
  }, [settings, stop])



  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
    }
  }, [])

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play()
    }
  }, [])

  const updateSettings = useCallback((newSettings: Partial<ElevenLabsTTSSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))

    // Update volume of current audio if playing
    if (audioRef.current && newSettings.volume !== undefined) {
      audioRef.current.volume = newSettings.volume
    }
  }, [])

  // Check if Eleven Labs is configured on mount
  useEffect(() => {
    checkConfiguration()
  }, [checkConfiguration])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const actions: ElevenLabsTTSActions = {
    speak,
    stop,
    pause,
    resume,
    updateSettings,
    checkConfiguration,
  }

  return {
    state,
    settings,
    actions,
  }
}
