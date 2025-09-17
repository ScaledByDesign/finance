import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'TTS Test Endpoint',
    instructions: [
      '1. Open browser console',
      '2. Run: fetch("/api/v1/tts/test", {method: "POST"}).then(r => r.json()).then(console.log)',
      '3. Check if audio plays successfully'
    ]
  })
}

export async function POST() {
  try {
    // Test with a simple message
    const testResponse = await fetch('http://localhost:3000/api/v1/tts/elevenlabs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello! This is a quick test of the Eleven Labs integration.',
        voice_preset: 'professional_female'
      })
    })

    if (!testResponse.ok) {
      const errorData = await testResponse.json()
      return NextResponse.json({
        success: false,
        error: errorData.error || 'TTS request failed',
        status: testResponse.status
      }, { status: 500 })
    }

    const data = await testResponse.json()
    
    return NextResponse.json({
      success: true,
      message: 'TTS test completed successfully',
      audio_available: !!data.audio_base64,
      audio_size: data.audio_base64?.length || 0,
      characters_used: data.characters_used,
      voice_id: data.voice_id,
      model_id: data.model_id,
      test_instructions: [
        'Copy the audio_base64 data',
        'Create a blob URL in browser console:',
        'const audioData = Uint8Array.from(atob("' + (data.audio_base64?.substring(0, 50) || '') + '..."), c => c.charCodeAt(0))',
        'const audioBlob = new Blob([audioData], { type: "audio/mpeg" })',
        'const audioUrl = URL.createObjectURL(audioBlob)',
        'const audio = new Audio(audioUrl)',
        'audio.play()'
      ]
    })
  } catch (error) {
    console.error('TTS test error:', error)
    return NextResponse.json({
      success: false,
      error: (error as any)?.message || 'Test failed'
    }, { status: 500 })
  }
}
