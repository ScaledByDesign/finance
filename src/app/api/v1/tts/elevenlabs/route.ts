import { NextRequest, NextResponse } from 'next/server'
import { createElevenLabsClient, extractTextForTTS, VOICE_PRESETS, MODELS } from '@/lib/elevenlabs'

export interface TTSRequest {
  text: string
  voice_id?: string
  voice_preset?: keyof typeof VOICE_PRESETS
  model_id?: string
  voice_settings?: {
    stability?: number
    similarity_boost?: number
    style?: number
    use_speaker_boost?: boolean
  }
  stream?: boolean
}

export async function POST(req: NextRequest) {
  try {
    // Check if Eleven Labs is configured
    const client = createElevenLabsClient()
    if (!client) {
      return NextResponse.json(
        { 
          error: 'Eleven Labs not configured',
          message: 'ELEVENLABS_API_KEY environment variable is required'
        },
        { status: 503 }
      )
    }

    const body: TTSRequest = await req.json()
    const { 
      text, 
      voice_id, 
      voice_preset = 'professional_female',
      model_id = MODELS.turbo,
      voice_settings,
      stream = false
    } = body

    // Validate input
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Clean text for TTS
    const cleanText = extractTextForTTS(text)
    
    if (cleanText.length === 0) {
      return NextResponse.json(
        { error: 'No valid text content found' },
        { status: 400 }
      )
    }

    // Determine voice ID
    const finalVoiceId = voice_id || VOICE_PRESETS[voice_preset] || VOICE_PRESETS.professional_female

    // Handle streaming vs non-streaming requests
    if (stream) {
      try {
        const audioStream = await client.streamTextToSpeech({
          text: cleanText,
          voice_id: finalVoiceId,
          model_id,
          voice_settings,
        })

        return new Response(audioStream, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        })
      } catch (error) {
        console.error('Streaming TTS error:', error)
        return NextResponse.json(
          { error: 'Failed to stream audio' },
          { status: 500 }
        )
      }
    } else {
      try {
        const result = await client.textToSpeech({
          text: cleanText,
          voice_id: finalVoiceId,
          model_id,
          voice_settings,
        })

        // Return the audio data as base64 instead of blob URL
        if (result.audio_data) {
          const base64Audio = Buffer.from(result.audio_data).toString('base64')

          return NextResponse.json({
            success: true,
            audio_base64: base64Audio,
            audio_type: 'audio/mpeg',
            characters_used: result.characters_used,
            voice_id: finalVoiceId,
            model_id,
            text_length: cleanText.length,
          })
        } else {
          throw new Error('No audio data received from Eleven Labs')
        }
      } catch (error) {
        console.error('TTS error:', error)
        return NextResponse.json(
          { error: 'Failed to generate audio' },
          { status: 500 }
        )
      }
    }
  } catch (error) {
    console.error('TTS API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const client = createElevenLabsClient()
    
    if (!client) {
      return NextResponse.json({
        status: 'not_configured',
        message: 'Eleven Labs TTS API',
        error: 'ELEVENLABS_API_KEY not found',
        fallback: 'Browser speech synthesis will be used'
      })
    }

    // Test the connection and get available voices
    try {
      const [voices, userInfo] = await Promise.all([
        client.getVoices(),
        client.getUserInfo().catch(() => null)
      ])

      return NextResponse.json({
        status: 'configured',
        message: 'Eleven Labs TTS API is ready',
        available_voices: voices.length,
        voice_presets: Object.keys(VOICE_PRESETS),
        models: Object.keys(MODELS),
        user_info: userInfo ? {
          subscription: userInfo.subscription,
          character_count: userInfo.character_count,
          character_limit: userInfo.character_limit,
        } : null,
        endpoints: {
          POST: '/api/v1/tts/elevenlabs - Generate speech from text',
        },
        example_request: {
          text: 'Hello, this is a test of Eleven Labs text-to-speech.',
          voice_preset: 'professional_female',
          model_id: 'eleven_turbo_v2_5',
          stream: false
        }
      })
    } catch (error) {
      const message = (error as any)?.message ?? 'Unknown error'
      return NextResponse.json({
        status: 'error',
        message: 'Eleven Labs API connection failed',
        error: message,
        fallback: 'Browser speech synthesis will be used'
      }, { status: 503 })
    }
  } catch (error) {
    console.error('TTS API GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
