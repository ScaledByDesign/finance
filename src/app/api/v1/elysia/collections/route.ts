import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    // Get user session
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get Elysia API URL from environment
    const elysiaUrl = process.env.ELYSIA_API_URL || 'http://localhost:8000'
    
    // Get collections from Elysia
    const collectionsResponse = await fetch(`${elysiaUrl}/collections`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!collectionsResponse.ok) {
      return NextResponse.json(
        { error: 'Collections service unavailable' },
        { status: 503 }
      )
    }

    const collections = await collectionsResponse.json()

    return NextResponse.json(collections)

  } catch (error) {
    console.error('Collections error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Get user session
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { collection_names } = await request.json()
    
    if (!collection_names || !Array.isArray(collection_names)) {
      return NextResponse.json(
        { error: 'collection_names array is required' },
        { status: 400 }
      )
    }

    // Get Elysia API URL from environment
    const elysiaUrl = process.env.ELYSIA_API_URL || 'http://localhost:8000'
    
    // Start preprocessing
    const preprocessResponse = await fetch(`${elysiaUrl}/preprocess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collection_names }),
    })

    if (!preprocessResponse.ok) {
      return NextResponse.json(
        { error: 'Preprocessing service unavailable' },
        { status: 503 }
      )
    }

    const result = await preprocessResponse.json()

    return NextResponse.json(result)

  } catch (error) {
    console.error('Preprocessing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
