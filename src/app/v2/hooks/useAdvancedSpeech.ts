'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export interface AudioProcessingSettings {
  noiseReduction: boolean
  echoCancellation: boolean
  autoGainControl: boolean
  sampleRate: number
  channelCount: number
}

export interface VoiceActivityDetection {
  enabled: boolean
  threshold: number
  minSpeechDuration: number
  maxSilenceDuration: number
}

export interface AdvancedSpeechState {
  isRecording: boolean
  audioLevel: number
  isVoiceDetected: boolean
  processingQuality: 'low' | 'medium' | 'high'
  latency: number
  error: string | null
}

const DEFAULT_AUDIO_SETTINGS: AudioProcessingSettings = {
  noiseReduction: true,
  echoCancellation: true,
  autoGainControl: true,
  sampleRate: 16000,
  channelCount: 1,
}

const DEFAULT_VAD_SETTINGS: VoiceActivityDetection = {
  enabled: true,
  threshold: 0.01,
  minSpeechDuration: 300, // ms
  maxSilenceDuration: 1500, // ms
}

export function useAdvancedSpeech() {
  const [state, setState] = useState<AdvancedSpeechState>({
    isRecording: false,
    audioLevel: 0,
    isVoiceDetected: false,
    processingQuality: 'medium',
    latency: 0,
    error: null,
  })

  const [audioSettings, setAudioSettings] = useState<AudioProcessingSettings>(DEFAULT_AUDIO_SETTINGS)
  const [vadSettings, setVadSettings] = useState<VoiceActivityDetection>(DEFAULT_VAD_SETTINGS)

  // Audio processing refs
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const filterNodeRef = useRef<BiquadFilterNode | null>(null)

  // Voice activity detection
  const vadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const speechStartTimeRef = useRef<number | null>(null)
  const lastVoiceTimeRef = useRef<number>(0)

  // Performance monitoring
  const performanceRef = useRef({
    startTime: 0,
    frameCount: 0,
    lastFrameTime: 0,
  })

  // Initialize advanced audio processing
  const initializeAudioProcessing = useCallback(async () => {
    try {
      // Request microphone access with advanced constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: audioSettings.echoCancellation,
          noiseSuppression: audioSettings.noiseReduction,
          autoGainControl: audioSettings.autoGainControl,
          sampleRate: audioSettings.sampleRate,
          channelCount: audioSettings.channelCount,
        },
      })

      mediaStreamRef.current = stream

      // Create audio context with optimal settings
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: audioSettings.sampleRate,
        latencyHint: 'interactive',
      })
      audioContextRef.current = audioContext

      // Create audio processing chain
      const source = audioContext.createMediaStreamSource(stream)
      
      // Gain control
      const gainNode = audioContext.createGain()
      gainNode.gain.value = 1.0
      gainNodeRef.current = gainNode

      // High-pass filter to remove low-frequency noise
      const filterNode = audioContext.createBiquadFilter()
      filterNode.type = 'highpass'
      filterNode.frequency.value = 80 // Remove frequencies below 80Hz
      filterNode.Q.value = 0.7
      filterNodeRef.current = filterNode

      // Analyser for voice activity detection and level monitoring
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8
      analyserRef.current = analyser

      // Audio processor for real-time analysis
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor

      processor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer
        const inputData = inputBuffer.getChannelData(0)
        
        // Calculate audio level (RMS)
        let sum = 0
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i]
        }
        const rms = Math.sqrt(sum / inputData.length)
        const audioLevel = Math.min(rms * 100, 100)

        // Voice activity detection
        const isVoiceDetected = vadSettings.enabled ? detectVoiceActivity(rms) : audioLevel > 1

        // Update performance metrics
        updatePerformanceMetrics()

        setState(prev => ({
          ...prev,
          audioLevel,
          isVoiceDetected,
          latency: audioContext.currentTime * 1000,
        }))
      }

      // Connect audio processing chain
      source.connect(gainNode)
      gainNode.connect(filterNode)
      filterNode.connect(analyser)
      analyser.connect(processor)
      processor.connect(audioContext.destination)

      setState(prev => ({ 
        ...prev, 
        isRecording: true, 
        error: null,
        processingQuality: determineProcessingQuality(audioContext)
      }))

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: `Failed to initialize audio: ${(error as any)?.message}`,
        isRecording: false 
      }))
    }
  }, [audioSettings, vadSettings])

  // Voice activity detection algorithm
  const detectVoiceActivity = useCallback((rms: number): boolean => {
    const currentTime = Date.now()
    const isAboveThreshold = rms > vadSettings.threshold

    if (isAboveThreshold) {
      lastVoiceTimeRef.current = currentTime
      
      if (!speechStartTimeRef.current) {
        speechStartTimeRef.current = currentTime
      }

      // Check if we've had speech for minimum duration
      const speechDuration = currentTime - speechStartTimeRef.current
      return speechDuration >= vadSettings.minSpeechDuration
    } else {
      // Check if silence has exceeded maximum duration
      const silenceDuration = currentTime - lastVoiceTimeRef.current
      
      if (silenceDuration > vadSettings.maxSilenceDuration) {
        speechStartTimeRef.current = null
        return false
      }

      // Continue considering it as voice if we're within silence threshold
      return speechStartTimeRef.current !== null
    }
  }, [vadSettings])

  // Determine processing quality based on audio context capabilities
  const determineProcessingQuality = useCallback((audioContext: AudioContext): 'low' | 'medium' | 'high' => {
    const sampleRate = audioContext.sampleRate
    const baseLatency = audioContext.baseLatency || 0

    if (sampleRate >= 48000 && baseLatency < 0.01) {
      return 'high'
    } else if (sampleRate >= 44100 && baseLatency < 0.02) {
      return 'medium'
    } else {
      return 'low'
    }
  }, [])

  // Update performance metrics
  const updatePerformanceMetrics = useCallback(() => {
    const now = performance.now()
    const perf = performanceRef.current

    if (perf.startTime === 0) {
      perf.startTime = now
    }

    perf.frameCount++
    perf.lastFrameTime = now
  }, [])

  // Stop audio processing
  const stopAudioProcessing = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    if (vadTimeoutRef.current) {
      clearTimeout(vadTimeoutRef.current)
      vadTimeoutRef.current = null
    }

    setState(prev => ({ 
      ...prev, 
      isRecording: false, 
      audioLevel: 0, 
      isVoiceDetected: false 
    }))
  }, [])

  // Apply audio enhancements
  const applyAudioEnhancements = useCallback((settings: Partial<AudioProcessingSettings>) => {
    setAudioSettings(prev => ({ ...prev, ...settings }))

    // Apply real-time changes if audio is active
    if (gainNodeRef.current && filterNodeRef.current) {
      if (settings.noiseReduction !== undefined) {
        // Adjust filter settings for noise reduction
        filterNodeRef.current.frequency.value = settings.noiseReduction ? 80 : 20
      }
    }
  }, [])

  // Update VAD settings
  const updateVADSettings = useCallback((settings: Partial<VoiceActivityDetection>) => {
    setVadSettings(prev => ({ ...prev, ...settings }))
  }, [])

  // Get audio processing statistics
  const getProcessingStats = useCallback(() => {
    const perf = performanceRef.current
    const currentTime = performance.now()
    const duration = currentTime - perf.startTime
    const fps = perf.frameCount / (duration / 1000)

    return {
      duration: Math.round(duration),
      frameCount: perf.frameCount,
      averageFPS: Math.round(fps),
      currentLatency: state.latency,
      processingQuality: state.processingQuality,
      audioLevel: state.audioLevel,
    }
  }, [state])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudioProcessing()
    }
  }, [stopAudioProcessing])

  return {
    state,
    audioSettings,
    vadSettings,
    actions: {
      startRecording: initializeAudioProcessing,
      stopRecording: stopAudioProcessing,
      applyAudioEnhancements,
      updateVADSettings,
      getProcessingStats,
    },
  }
}
