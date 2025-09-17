'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export interface RealtimeVoiceState {
  isConnected: boolean
  isTransmitting: boolean
  connectionQuality: 'poor' | 'fair' | 'good' | 'excellent'
  latency: number
  error: string | null
  serverStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
}

export interface VoicePacket {
  id: string
  timestamp: number
  audioData: ArrayBuffer
  metadata: {
    sampleRate: number
    channels: number
    duration: number
  }
}

export interface RealtimeConfig {
  serverUrl: string
  reconnectAttempts: number
  reconnectDelay: number
  heartbeatInterval: number
  audioBufferSize: number
  compressionEnabled: boolean
}

const DEFAULT_CONFIG: RealtimeConfig = {
  serverUrl: process.env.NODE_ENV === 'development' 
    ? 'ws://localhost:3002/api/v2/voice-realtime'
    : 'wss://your-domain.com/api/v2/voice-realtime',
  reconnectAttempts: 5,
  reconnectDelay: 1000,
  heartbeatInterval: 30000,
  audioBufferSize: 4096,
  compressionEnabled: true,
}

export function useRealtimeVoice(config: Partial<RealtimeConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  
  const [state, setState] = useState<RealtimeVoiceState>({
    isConnected: false,
    isTransmitting: false,
    connectionQuality: 'fair',
    latency: 0,
    error: null,
    serverStatus: 'disconnected',
  })

  // WebSocket and audio refs
  const wsRef = useRef<WebSocket | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)

  // Performance monitoring
  const latencyMeasurementRef = useRef<Map<string, number>>(new Map())
  const qualityMetricsRef = useRef({
    packetsLost: 0,
    totalPackets: 0,
    averageLatency: 0,
  })

  // Initialize WebSocket connection
  const connect: () => Promise<void> = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return // Already connected
    }

    setState(prev => ({ ...prev, serverStatus: 'connecting', error: null }))

    try {
      const ws = new WebSocket(finalConfig.serverUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setState(prev => ({ 
          ...prev, 
          isConnected: true, 
          serverStatus: 'connected',
          error: null 
        }))
        
        reconnectAttemptsRef.current = 0
        startHeartbeat()
        
        // Send initial configuration
        sendMessage({
          type: 'config',
          data: {
            audioBufferSize: finalConfig.audioBufferSize,
            compressionEnabled: finalConfig.compressionEnabled,
          }
        })
      }

      ws.onmessage = (event) => {
        handleServerMessage(event.data)
      }

      ws.onclose = (event) => {
        setState(prev => ({ 
          ...prev, 
          isConnected: false, 
          serverStatus: 'disconnected',
          isTransmitting: false 
        }))
        
        stopHeartbeat()
        
        if (!event.wasClean && reconnectAttemptsRef.current < finalConfig.reconnectAttempts) {
          scheduleReconnect()
        }
      }

      ws.onerror = (error) => {
        setState(prev => ({ 
          ...prev, 
          error: 'WebSocket connection error',
          serverStatus: 'error' 
        }))
      }

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: `Failed to connect: ${(error as any)?.message}`,
        serverStatus: 'error' 
      }))
    }
  }, [finalConfig.serverUrl])

  // Handle incoming server messages
  const handleServerMessage = useCallback((data: string | ArrayBuffer) => {
    try {
      if (typeof data === 'string') {
        const message = JSON.parse(data)

        switch (message.type) {
          case 'pong':
            // Calculate latency
            const sentTime = latencyMeasurementRef.current.get(message.id)
            if (sentTime) {
              const latency = Date.now() - sentTime
              setState(prev => ({ ...prev, latency }))
              updateConnectionQuality(latency)
              latencyMeasurementRef.current.delete(message.id)
            }
            break

          case 'audio_response':
            // Handle incoming audio data
            playAudioResponse(message.data)
            break

          case 'transcription':
            // Handle real-time transcription
            onTranscriptionReceived?.(message.data)
            break

          case 'error':
            setState(prev => ({ ...prev, error: message.message }))
            break
        }
      } else {
        // Handle binary audio data
        playAudioBuffer(data)
      }
    } catch (error) {
      console.error('Error handling server message:', error)
    }
  }, [])

  // Send message to server
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  // Start audio transmission
  const startTransmission = useCallback(async () => {
    if (!state.isConnected) {
      await connect()
    }

    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        }
      })

      mediaStreamRef.current = stream

      // Create audio context
      const audioContext = new AudioContext({ sampleRate: 16000 })
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      const processor = audioContext.createScriptProcessor(finalConfig.audioBufferSize, 1, 1)
      processorRef.current = processor

      processor.onaudioprocess = (event) => {
        if (state.isTransmitting && wsRef.current?.readyState === WebSocket.OPEN) {
          const inputBuffer = event.inputBuffer
          const inputData = inputBuffer.getChannelData(0)
          
          // Convert to ArrayBuffer
          const audioBuffer = new ArrayBuffer(inputData.length * 4)
          const view = new Float32Array(audioBuffer)
          view.set(inputData)

          // Create voice packet
          const packet: VoicePacket = {
            id: generatePacketId(),
            timestamp: Date.now(),
            audioData: audioBuffer,
            metadata: {
              sampleRate: audioContext.sampleRate,
              channels: 1,
              duration: inputData.length / audioContext.sampleRate,
            }
          }

          // Send audio data
          sendAudioPacket(packet)
          updateQualityMetrics()
        }
      }

      source.connect(processor)
      processor.connect(audioContext.destination)

      setState(prev => ({ ...prev, isTransmitting: true }))

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: `Failed to start transmission: ${(error as any)?.message}` 
      }))
    }
  }, [state.isConnected, finalConfig.audioBufferSize, connect])

  // Stop audio transmission
  const stopTransmission = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    setState(prev => ({ ...prev, isTransmitting: false }))
  }, [])

  // Send audio packet to server
  const sendAudioPacket = useCallback((packet: VoicePacket) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Send metadata first
      sendMessage({
        type: 'audio_packet',
        id: packet.id,
        timestamp: packet.timestamp,
        metadata: packet.metadata,
      })

      // Send binary audio data
      wsRef.current.send(packet.audioData)
      
      qualityMetricsRef.current.totalPackets++
    }
  }, [sendMessage])

  // Play audio response from server
  const playAudioResponse = useCallback(async (audioData: ArrayBuffer) => {
    try {
      const audioContext = new AudioContext()
      const audioBuffer = await audioContext.decodeAudioData(audioData)
      const source = audioContext.createBufferSource()
      
      source.buffer = audioBuffer
      source.connect(audioContext.destination)
      source.start()
    } catch (error) {
      console.error('Error playing audio response:', error)
    }
  }, [])

  // Play raw audio buffer
  const playAudioBuffer = useCallback((buffer: ArrayBuffer) => {
    // Implementation for playing raw audio buffer
    // This would typically involve converting the buffer to playable format
  }, [])

  // Update connection quality based on latency and packet loss
  const updateConnectionQuality = useCallback((latency: number) => {
    const metrics = qualityMetricsRef.current
    const packetLossRate = metrics.totalPackets > 0 ? metrics.packetsLost / metrics.totalPackets : 0

    let quality: RealtimeVoiceState['connectionQuality']
    
    if (latency < 50 && packetLossRate < 0.01) {
      quality = 'excellent'
    } else if (latency < 100 && packetLossRate < 0.05) {
      quality = 'good'
    } else if (latency < 200 && packetLossRate < 0.1) {
      quality = 'fair'
    } else {
      quality = 'poor'
    }

    setState(prev => ({ ...prev, connectionQuality: quality }))
  }, [])

  // Update quality metrics
  const updateQualityMetrics = useCallback(() => {
    // This would be called periodically to update packet loss and other metrics
    // Implementation depends on server feedback
  }, [])

  // Start heartbeat to maintain connection
  const startHeartbeat = useCallback(() => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const pingId = generatePacketId()
        latencyMeasurementRef.current.set(pingId, Date.now())
        
        sendMessage({
          type: 'ping',
          id: pingId,
          timestamp: Date.now(),
        })
      }
    }, finalConfig.heartbeatInterval)
  }, [finalConfig.heartbeatInterval, sendMessage])

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
  }, [])

  // Schedule reconnection attempt
  const scheduleReconnect = useCallback(() => {
    reconnectAttemptsRef.current++
    const delay = finalConfig.reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1)
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect()
    }, delay)
  }, [finalConfig.reconnectDelay, connect])

  // Disconnect from server
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    stopHeartbeat()
    stopTransmission()

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected')
      wsRef.current = null
    }

    setState(prev => ({ 
      ...prev, 
      isConnected: false, 
      serverStatus: 'disconnected',
      isTransmitting: false 
    }))
  }, [stopHeartbeat, stopTransmission])

  // Generate unique packet ID
  const generatePacketId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  // Callback placeholders (can be passed as props)
  const onTranscriptionReceived = useCallback((transcription: string) => {
    // Handle real-time transcription
  }, [])

  return {
    state,
    actions: {
      connect,
      disconnect,
      startTransmission,
      stopTransmission,
      sendMessage,
    },
    metrics: {
      getQualityMetrics: () => qualityMetricsRef.current,
      getLatency: () => state.latency,
      getConnectionQuality: () => state.connectionQuality,
    }
  }
}
