import { openai } from '@ai-sdk/openai'
import { streamText, convertToCoreMessages } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { getUserInfo } from '@/server/auth'
import { getTransaction } from '@/server/transaction'
import { getDashboard } from '@/server/user'

// Financial context system prompt
const FINANCIAL_ASSISTANT_PROMPT = `You are an advanced AI financial assistant with access to real-time financial data. Your role is to:

1. **Analyze Financial Data**: Provide insights based on actual account balances, transactions, and spending patterns
2. **Offer Actionable Advice**: Give specific, personalized recommendations for budgeting, saving, and investing
3. **Voice-Optimized Responses**: Keep responses conversational and concise for voice interaction
4. **Contextual Understanding**: Remember previous conversation context and user preferences

**Response Guidelines:**
- Keep responses under 150 words for voice clarity
- Use natural, conversational language
- Provide specific numbers and actionable insights
- Ask follow-up questions to engage the user
- Be encouraging and supportive about financial goals

**Available Functions:**
- Access real account balances and transaction history
- Calculate spending patterns and trends
- Provide investment recommendations
- Analyze budget performance
- Generate financial reports

Always prioritize user privacy and security. Never share sensitive financial information inappropriately.`

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

interface VoiceChatRequest {
  messages: ChatMessage[]
  voice?: boolean
  userId?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: VoiceChatRequest = await req.json()
    const { messages, voice = false } = body

    // Get user context for personalized responses
    let userContext = ''
    try {
      const user = await getUserInfo()
      if (user) {
        // Get dashboard data for context
        const dashboardData: any = await getDashboard()
        
        // Get recent transactions for spending analysis
        const recentTransactions = await getTransaction({
          currentPage: 1,
          pageSize: 10,
          filterDate: {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
            endDate: new Date().toISOString().split('T')[0]
          },
          selectedAccounts: [],
          selectedCategories: [],
          selectedPaymentChannel: 'all',
          merchantName: '',
          priceRange: { minPrice: '', maxPrice: '' },
          selectedFinCategories: []
        })

        userContext = `
**User Financial Context:**
- Total Balance: $${dashboardData?.totalCurrentBalance?.toLocaleString() || 'N/A'}
- Available Balance: $${dashboardData?.totalAvailableBalance?.toLocaleString() || 'N/A'}
- Recent Transactions: ${recentTransactions?.size || 0} transactions in last 30 days
- Account Types: ${dashboardData?.accounts?.map((acc: any) => acc.type).join(', ') || 'N/A'}

Use this context to provide personalized financial advice and insights.`
      }
    } catch (error) {
      console.log('Could not fetch user context:', error)
      userContext = 'User context unavailable - provide general financial guidance.'
    }

    // Prepare messages with system context
    const systemMessage = {
      role: 'system' as const,
      content: FINANCIAL_ASSISTANT_PROMPT + '\n\n' + userContext
    }

    const coreMessages = convertToCoreMessages([
      systemMessage,
      ...messages
    ])

    // Stream the response
    const result = await streamText({
      model: openai('gpt-4o'),
      messages: coreMessages,
      temperature: 0.7,
      maxTokens: voice ? 200 : 500, // Shorter responses for voice
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Voice chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process voice chat request' },
      { status: 500 }
    )
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Voice Chat API is running',
    endpoints: {
      POST: '/api/v2/voice-chat - Send chat messages',
    },
    features: [
      'Real-time financial data integration',
      'Streaming AI responses',
      'Voice-optimized responses',
      'Contextual conversation memory'
    ]
  })
}
