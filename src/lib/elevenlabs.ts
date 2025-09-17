/**
 * Eleven Labs Text-to-Speech Integration
 * Provides high-quality voice synthesis for AI chat responses
 */

export interface ElevenLabsVoice {
  voice_id: string
  name: string
  category: string
  description?: string
  preview_url?: string
  available_for_tiers?: string[]
}

export interface ElevenLabsSettings {
  voice_id: string
  model_id: string
  voice_settings: {
    stability: number
    similarity_boost: number
    style?: number
    use_speaker_boost?: boolean
  }
  output_format: string
}

export interface TTSRequest {
  text: string
  voice_id?: string
  model_id?: string
  voice_settings?: {
    stability?: number
    similarity_boost?: number
    style?: number
    use_speaker_boost?: boolean
  }
}

export interface TTSResponse {
  audio_url: string
  audio_data?: ArrayBuffer
  duration?: number
  characters_used: number
}

// Default voice settings optimized for financial assistant
export const DEFAULT_VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true
}

// Popular voice IDs for different use cases
export const VOICE_PRESETS = {
  // Professional voices for financial content
  professional_male: 'pNInz6obpgDQGcFmaJgB', // Adam - clear, professional
  professional_female: 'EXAVITQu4vr4xnSDxMaL', // Bella - warm, professional
  
  // Conversational voices for casual chat
  conversational_male: 'VR6AewLTigWG4xSOukaG', // Arnold - friendly, conversational
  conversational_female: 'oWAxZDx7w5VEj9dCyTzz', // Grace - natural, engaging
  
  // Authoritative voices for important information
  authoritative_male: 'bVMeCyTHy58xNoL34h3p', // Jeremy - confident, clear
  authoritative_female: 'ThT5KcBeYPX3keUQqHPh', // Dorothy - authoritative, trustworthy
}

// Model IDs for different quality levels
export const MODELS = {
  turbo: 'eleven_turbo_v2_5', // Fastest, good quality
  multilingual: 'eleven_multilingual_v2', // Best for multiple languages
  monolingual: 'eleven_monolingual_v1', // Best quality for English
}

export class ElevenLabsClient {
  private apiKey: string
  private baseUrl: string = 'https://api.elevenlabs.io/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Get available voices from Eleven Labs
   */
  async getVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`)
      }

      const data = await response.json()
      return data.voices || []
    } catch (error) {
      console.error('Error fetching voices:', error)
      throw error
    }
  }

  /**
   * Convert text to speech using Eleven Labs
   */
  async textToSpeech(request: TTSRequest): Promise<TTSResponse> {
    const {
      text,
      voice_id = VOICE_PRESETS.professional_female,
      model_id = MODELS.turbo,
      voice_settings = DEFAULT_VOICE_SETTINGS
    } = request

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voice_id}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings,
        }),
      })

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.statusText}`)
      }

      // Get audio data as ArrayBuffer
      const audioData = await response.arrayBuffer()
      
      // Create blob URL for audio playback
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' })
      const audio_url = URL.createObjectURL(audioBlob)

      // Get character count from headers
      const charactersUsed = parseInt(response.headers.get('character-count') || '0')

      return {
        audio_url,
        audio_data: audioData,
        characters_used: charactersUsed,
      }
    } catch (error) {
      console.error('Error in text-to-speech:', error)
      throw error
    }
  }

  /**
   * Stream text to speech (for real-time generation)
   */
  async streamTextToSpeech(request: TTSRequest): Promise<ReadableStream> {
    const {
      text,
      voice_id = VOICE_PRESETS.professional_female,
      model_id = MODELS.turbo,
      voice_settings = DEFAULT_VOICE_SETTINGS
    } = request

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voice_id}/stream`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings,
        }),
      })

      if (!response.ok) {
        throw new Error(`TTS stream request failed: ${response.statusText}`)
      }

      return response.body!
    } catch (error) {
      console.error('Error in streaming text-to-speech:', error)
      throw error
    }
  }

  /**
   * Get voice information by ID
   */
  async getVoice(voiceId: string): Promise<ElevenLabsVoice> {
    try {
      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch voice: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching voice:', error)
      throw error
    }
  }

  /**
   * Get user subscription info and usage
   */
  async getUserInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching user info:', error)
      throw error
    }
  }
}

/**
 * Utility function to extract clean text from AI response for TTS
 */
export function extractTextForTTS(content: string): string {
  // Remove markdown formatting
  let cleanText = content
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/\n{2,}/g, '. ') // Replace multiple newlines with periods
    .replace(/\n/g, ' ') // Replace single newlines with spaces
    .trim()

  // Limit length for TTS (Eleven Labs has character limits)
  const maxLength = 2500
  if (cleanText.length > maxLength) {
    cleanText = cleanText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
  }

  return cleanText
}

/**
 * Create Eleven Labs client instance
 */
export function createElevenLabsClient(): ElevenLabsClient | null {
  const apiKey = process.env.ELEVENLABS_API_KEY || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
  
  if (!apiKey) {
    console.warn('Eleven Labs API key not found. TTS will fall back to browser speech synthesis.')
    return null
  }

  return new ElevenLabsClient(apiKey)
}
