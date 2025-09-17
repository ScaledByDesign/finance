import { NextResponse } from 'next/server'

interface HealthResponse {
  status: string
  elysia_version: string
  weaviate_connected: boolean
}

export async function GET() {
  try {
    // Get Elysia API URL from environment
    const elysiaUrl = process.env.ELYSIA_API_URL || 'http://localhost:8000'
    
    // Check Elysia health
    const healthResponse = await fetch(`${elysiaUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!healthResponse.ok) {
      return NextResponse.json(
        { 
          status: 'unhealthy',
          error: 'Elysia service unavailable',
          elysia_url: elysiaUrl
        },
        { status: 503 }
      )
    }

    const healthData: HealthResponse = await healthResponse.json()

    return NextResponse.json({
      status: 'healthy',
      services: {
        elysia: healthData,
        weaviate: {
          connected: healthData.weaviate_connected,
          url: process.env.WEAVIATE_URL || 'http://localhost:8080'
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Failed to connect to Elysia service',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}
