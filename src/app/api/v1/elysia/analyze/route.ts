import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

interface AnalysisRequest {
  query: string
  financial_data?: any
  collection_names?: string[]
  user_id?: string
}

interface AnalysisResponse {
  response: string
  objects?: any[]
  metadata?: any
}

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: AnalysisRequest = await request.json()
    
    if (!body.query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Get Elysia API URL from environment
    const elysiaUrl = process.env.ELYSIA_API_URL || 'http://localhost:8000'
    
    // Prepare request for Elysia
    const elysiaRequest: AnalysisRequest = {
      query: body.query,
      financial_data: body.financial_data,
      collection_names: body.collection_names || ['UserTransactions', 'UserAccounts'],
      user_id: session.user.email
    }

    // Call Elysia API
    const elysiaResponse = await fetch(`${elysiaUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(elysiaRequest),
    })

    if (!elysiaResponse.ok) {
      const errorText = await elysiaResponse.text()
      console.error('Elysia API error:', errorText)
      return NextResponse.json(
        { error: 'Analysis service unavailable' },
        { status: 503 }
      )
    }

    const result: AnalysisResponse = await elysiaResponse.json()

    return NextResponse.json(result)

  } catch (error) {
    console.error('Elysia analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Elysia Analysis API',
    endpoints: {
      POST: '/api/v1/elysia/analyze - Analyze financial data with AI'
    }
  })
}
