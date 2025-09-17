import 'server-only'

import {
  createStreamableUI,
  createStreamableValue
} from 'ai/rsc'

import { BotCard, BotMessage } from '@/components/chatui/message'
import { nanoid } from '@/lib/utils'

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

// Helper function to determine if a query should use Elysia
function isComplexFinancialQuery(query: string): boolean {
  const complexKeywords = [
    'analyze', 'analysis', 'pattern', 'trend', 'optimize', 'optimization',
    'recommend', 'recommendation', 'predict', 'prediction', 'forecast',
    'compare', 'comparison', 'strategy', 'portfolio', 'investment',
    'budget', 'spending', 'saving', 'goal', 'risk', 'diversification',
    'insights', 'deep dive', 'comprehensive', 'detailed analysis'
  ]

  const lowerQuery = query.toLowerCase()
  return complexKeywords.some(keyword => lowerQuery.includes(keyword)) ||
         query.length > 100 // Long queries likely need complex analysis
}

// Enhanced chat function that routes to Elysia for complex analysis
export async function submitElysiaMessage(
  content: string,
  userEmail: string,
  financialData?: any
) {
  const uiStream = createStreamableUI()
  const textStream = createStreamableValue('')

  // Start with loading state
  uiStream.update(
    <BotMessage content="Analyzing your financial data with advanced AI..." />
  )

  try {
    // Check if this is a complex query that should use Elysia
    if (isComplexFinancialQuery(content)) {
      // Use Elysia for complex analysis
      const elysiaResult = await callElysiaAnalysis({
        query: content,
        financial_data: financialData,
        collection_names: ['UserTransactions', 'UserAccounts', 'FinancialGoals'],
        user_id: userEmail
      })

      if (elysiaResult) {
        // Stream the Elysia response
        textStream.update(elysiaResult.response)
        
        uiStream.update(
          <BotCard>
            <div className="space-y-4">
              <BotMessage content={elysiaResult.response} />
              
              {elysiaResult.objects && elysiaResult.objects.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">
                    Related Data Found:
                  </h4>
                  <div className="text-xs text-gray-600">
                    {elysiaResult.objects.length} relevant items analyzed
                  </div>
                </div>
              )}
              
              {elysiaResult.metadata && (
                <div className="mt-2 text-xs text-gray-500">
                  Analysis powered by Elysia AI • {new Date().toLocaleTimeString()}
                </div>
              )}
            </div>
          </BotCard>
        )
      } else {
        // Fallback if Elysia fails
        uiStream.update(
          <BotMessage content="I apologize, but I'm having trouble with the advanced analysis right now. Let me provide a basic response instead." />
        )
      }
    } else {
      // For simple queries, provide a quick response
      const simpleResponse = generateSimpleResponse(content)
      textStream.update(simpleResponse)
      
      uiStream.update(
        <BotMessage content={simpleResponse} />
      )
    }

  } catch (error) {
    console.error('Elysia chat error:', error)
    
    uiStream.update(
      <BotMessage content="I encountered an error while analyzing your request. Please try again or rephrase your question." />
    )
  }

  textStream.done()
  uiStream.done()

  return {
    id: nanoid(),
    role: 'assistant' as const,
    content: textStream.value,
    display: uiStream.value
  }
}

// Call Elysia API for analysis
async function callElysiaAnalysis(request: AnalysisRequest): Promise<AnalysisResponse | null> {
  try {
    const elysiaUrl = process.env.ELYSIA_API_URL || 'http://localhost:8000'
    
    const response = await fetch(`${elysiaUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      console.error('Elysia API error:', response.status, response.statusText)
      return null
    }

    const result: AnalysisResponse = await response.json()
    return result

  } catch (error) {
    console.error('Failed to call Elysia API:', error)
    return null
  }
}

// Generate simple responses for basic queries
function generateSimpleResponse(query: string): string {
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
    return "Hello! I'm your AI financial assistant. I can help you analyze your spending, investments, and provide financial insights. What would you like to know about your finances?"
  }

  if (lowerQuery.includes('balance')) {
    return "I can help you check your account balances. Would you like me to show your current account information?"
  }

  if (lowerQuery.includes('transaction')) {
    return "I can help you review your transactions. Would you like to see recent transactions or search for specific ones?"
  }

  if (lowerQuery.includes('help')) {
    return "I can help you with:\n• Account balance inquiries\n• Transaction analysis\n• Spending pattern insights\n• Investment recommendations\n• Budget optimization\n• Financial goal tracking\n\nWhat specific area would you like assistance with?"
  }

  // Default response for unrecognized simple queries
  return "I understand you're asking about your finances. For detailed analysis and insights, try asking more specific questions like 'analyze my spending patterns' or 'what are my investment recommendations?'"
}

// Health check for Elysia service
export async function checkElysiaHealth(): Promise<boolean> {
  try {
    const elysiaUrl = process.env.ELYSIA_API_URL || 'http://localhost:8000'
    
    const response = await fetch(`${elysiaUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.ok
  } catch (error) {
    console.error('Elysia health check failed:', error)
    return false
  }
}
