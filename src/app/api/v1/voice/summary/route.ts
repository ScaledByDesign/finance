import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { extractTextForTTS } from '@/lib/elevenlabs'

interface SummaryRequest {
  text: string
  maxWords?: number
  style?: 'calm' | 'neutral' | 'friendly'
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SummaryRequest
    let { text, maxWords = 45, style = 'calm' } = body

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Clean and bound the text length for the model
    text = extractTextForTTS(text).slice(0, 2000)

    const styleLine =
      style === 'friendly'
        ? 'Use a friendly, conversational tone.'
        : style === 'calm'
        ? 'Use a calm, clear, trustworthy tone.'
        : 'Use a neutral, concise tone.'

    const { text: summary } = await generateText({
      model: openai('gpt-4o-mini'),
      system: `You write short, voice-friendly summaries for a personal finance assistant.
Keep it natural and easy to hear. Avoid code, paths, filenames, placeholder words, or UI labels.
Include specific numbers when available. ${styleLine}
Hard limit: ${maxWords} words. Output only the summary with no prefixes.`,
      prompt: `Source content to summarize for voice:
"""
${text}
"""`
    })

    return NextResponse.json({ summary: summary.trim() })
  } catch (error) {
    console.error('Voice summary error:', error)
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
  }
}

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

