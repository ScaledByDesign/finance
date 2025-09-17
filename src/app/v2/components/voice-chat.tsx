'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVoiceChat } from '../hooks/useVoiceChat'
import { useElevenLabsTTS } from '../hooks/useElevenLabsTTS'
import { VOICE_PRESETS } from '@/lib/elevenlabs'
import {
  MicrophoneIcon,
  MoonIcon,
  SunIcon,
  ChartBarIcon,
  CreditCardIcon,
  CogIcon,
  XIcon,
  SpeakerphoneIcon,
  StopIcon,
  LightBulbIcon,
  HomeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/outline'
import { nanoid } from 'nanoid'
import { useActions, useUIState, useAIState } from 'ai/rsc'
import { UserMessage } from '@/components/chatui/message'
import { type AI } from '@/lib/chat/actions'
import { PWAInstallButtonCompact } from './pwa-install-button'
import { PWAStatus } from './pwa-status'
import { LoanApplicationModal } from './loan-application-modal'

interface VoiceChatProps {
  onNavigate: (screen: string) => void
  isDarkMode: boolean
  onToggleTheme: () => void
}

export function VoiceChat({ onNavigate, isDarkMode, onToggleTheme }: VoiceChatProps) {
  // AI Chat integration
  // Note: avoid TSX generic angle-bracket parsing issues in ESLint by omitting explicit generics here
  const { submitUserMessage } = useActions()
  const [messages, setMessages] = useUIState()
  const [aiState] = useAIState()

  // Voice chat functionality
  const { state: voiceState, actions: voiceActions } = useVoiceChat()
  const {
    startListening,
    stopListening,
    speak: browserSpeak,
    stopSpeaking,
    checkMicrophonePermission,
    clearTranscript,
  } = voiceActions

  // Test loan modal state
  const [showTestLoanModal, setShowTestLoanModal] = useState(false)

  // Eleven Labs TTS integration (respect Settings defaults from localStorage)
  const initialVoiceSettings = useMemo(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('aiVoiceSettingsV2')
        if (raw) {
          const s = JSON.parse(raw)
          const preset: keyof typeof VOICE_PRESETS = (s.voicePreset && (s.voicePreset in (VOICE_PRESETS as any))) ? s.voicePreset as keyof typeof VOICE_PRESETS : 'professional_female'
          return {
            voice_preset: preset,
            model_id: s.modelId,
            voice_settings: {
              stability: s.voiceStability ?? 0.75,
              similarity_boost: s.voiceSimilarity ?? 0.65,
              style: s.voiceStyle ?? 0.15,
              use_speaker_boost: s.useSpeakerBoost ?? true,
            },
            autoPlay: s.voiceAutoplay ?? true,
            volume: s.voiceVolume ?? 0.85,
          }
        }
      } catch {}
    }
    return {
      voice_preset: 'professional_female' as keyof typeof VOICE_PRESETS,
      autoPlay: true,
      volume: 0.85,
    }
  }, [])

  const elevenLabsTTS = useElevenLabsTTS(initialVoiceSettings)

  // Local state
  const [input, setInput] = useState('')
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)
  const [useElevenLabs, setUseElevenLabs] = useState(true)
  const [ttsDebug, setTtsDebug] = useState<{ text: string; engine: string } | null>(null)
  const [showTtsDebug, setShowTtsDebug] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const handleSendMessageRef = useRef<(message: string) => void>()

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = useCallback(async (message: string) => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage) return

    // Add user message to UI
    setMessages((currentMessages: any) => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{trimmedMessage}</UserMessage>
      }
    ])

    // Submit to AI and get response
    try {
      const responseMessage = await submitUserMessage(trimmedMessage)

      setMessages((currentMessages: any) => [
        ...currentMessages,
        responseMessage
      ])

      // Auto-speak AI response if voice is enabled
      if (isVoiceEnabled && responseMessage.display) {
        let textToSpeak = safeExtractTextFromResponse(responseMessage)

        // If extraction failed, create a concise helpful fallback
        if (!textToSpeak || textToSpeak.trim().length === 0) {
          console.warn('Primary extraction failed, using smart fallback...')
          textToSpeak = createSmartFallback(responseMessage)
        } else {
          console.log('Successfully extracted text:', textToSpeak)
        }

        // Generate a succinct voice summary via server (preferred)
        // If we couldn't extract any text, fall back to the raw display JSON as source
        let summarySource = textToSpeak && textToSpeak.trim().length > 0
          ? textToSpeak
          : (() => { try { return JSON.stringify(responseMessage.display || responseMessage) } catch { return '' } })()
        let summaryText = textToSpeak
        try {
          const res = await fetch('/api/v1/voice/summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: summarySource, maxWords: 45, style: 'calm' })
          })
          if (res.ok) {
            const data = await res.json()
            if (data?.summary) summaryText = data.summary
          }
        } catch (e) {
          console.warn('Voice summary API failed, using local formatting')
        }

        // If server summary falls back to empty for any reason, apply local friendly formatting/smart fallback
        if (!summaryText || summaryText.trim().length === 0) {
          summaryText = textToSpeak && textToSpeak.trim().length > 0
            ? makeFriendlyVoiceResponse(textToSpeak)
            : createSmartFallback(responseMessage)
        }

        console.log('Final text to speak:', textToSpeak)

        if (textToSpeak) {
          // Update on-screen debug preview
          const engine = (useElevenLabs && elevenLabsTTS.state.isConfigured)
            ? `ElevenLabs • ${String((elevenLabsTTS as any).settings?.voice_preset || 'preset')} • ${String((elevenLabsTTS as any).settings?.model_id || 'turbo')}`
            : 'Browser TTS'
          if (showTtsDebug) setTtsDebug({ text: summaryText, engine })

          // Use Eleven Labs TTS if configured and enabled, otherwise fall back to browser TTS
          if (useElevenLabs && elevenLabsTTS.state.isConfigured) {
            elevenLabsTTS.actions.speak(summaryText)
          } else {
            browserSpeak(summaryText)
          }
        }
      }
    } catch (error) {
      console.error('Error submitting message:', error)
    }

    setInput('')
  }, [
    submitUserMessage,
    setMessages,
    isVoiceEnabled,
    useElevenLabs,
    elevenLabsTTS,
    browserSpeak,
    showTtsDebug,
  ])

  // Store the latest handleSendMessage in ref to avoid dependency issues
  handleSendMessageRef.current = handleSendMessage

  // Handle voice input completion
  useEffect(() => {
    if (voiceState.currentTranscript && !voiceState.isListening) {
      const transcript = voiceState.currentTranscript
      handleSendMessageRef.current?.(transcript)
      clearTranscript()
    }
  }, [voiceState.currentTranscript, voiceState.isListening, clearTranscript])

  // Safer, simpler extractor to avoid grabbing unrelated text
  const safeExtractTextFromResponse = (message: any): string => {
    try {
      // Ignore if we're still showing placeholders/skeletons/spinners
      if (containsLoadingPlaceholder(message?.display)) return ''

      // Prefer a concise summary from known UI components
      const summarized = summarizeDisplayNode(message?.display)
      if (summarized && summarized.trim().length > 0) return sanitizeForTTS(summarized)

      // If the display itself is a string
      if (typeof message?.display === 'string') return sanitizeForTTS(message.display)

      // If the component has a `content` prop (BotMessage), use it
      if (message?.display?.props?.content) return sanitizeForTTS(String(message.display.props.content))

      // Extract visible text from children
      if (message?.display?.props?.children) {
        const extracted = extractTextFromChildren(message.display.props.children)
        const cleaned = sanitizeForTTS(extracted)
        if (cleaned && cleaned.trim().length > 0) return cleaned
      }

      // Last resort: scan for string-like nodes
      const fallback = extractTextFromAnyNode(message?.display)
      const cleanedFallback = sanitizeForTTS(fallback)
      return cleanedFallback || ''
    } catch {
      return ''
    }
  };

  const containsLoadingPlaceholder = (node: any): boolean => {
    try {
      if (!node) return false
      const typeName = node?.type?.displayName || node?.type?.name || ''
      const tn = String(typeName).toLowerCase()
      if (tn.includes('spinner') || tn.includes('skeleton') || tn.includes('pending')) return true
      const text = typeof node === 'string' ? node.toLowerCase() : ''
      if (text.includes('loading') || text.includes('pending')) return true
      const children = node?.props?.children
      if (Array.isArray(children)) return children.some(containsLoadingPlaceholder)
      if (children) return containsLoadingPlaceholder(children)
      return false
    } catch {
      return false
    }
  }

  // Remove filenames, code snippets, urls and technical noise from TTS
  const sanitizeForTTS = (input: string): string => {
    if (!input) return ''
    let text = input
      // Remove code fences and inline code
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`]*`/g, ' ')
      // Remove URLs
      .replace(/https?:\/\/\S+/gi, ' ')
      // Remove module/path-like tokens (with slashes)
      .replace(/(^|\s)[\w.-]+\/[\w./-]+(\s|$)/g, ' ')
      // Remove file names with common extensions
      .replace(/\b[\w-]+\.(pdf|png|jpg|jpeg|gif|svg|tsx|ts|js|jsx|json|md|txt|csv|xlsx|docx|pptx)\b/gi, ' ')
      // Remove known technical noise words
      .replace(/\b(resolved module|module|app-pages-browser|static|chunks?|client|server|pending|spinner|spinnermessage|skeleton)\b/gi, ' ')
      // Replace underscores with spaces and collapse repeats
      .replace(/_/g, ' ')
      // Remove leftover non-word artifacts
      .replace(/[{}\[\]<>]+/g, ' ')
      // Collapse multiple spaces
      .replace(/\s{2,}/g, ' ')
      .trim()

    // If the result is too short or still looks like a filename/path, drop it
    if (text.length < 8) return ''
    if (/\b[A-Za-z0-9_-]+\.[A-Za-z0-9]{2,4}\b/.test(text)) return ''
    if (/[\w.-]+\/[\w./-]+/.test(text)) return ''
    return text
  }

  const extractTextFromResponse = (message: any): string => {
    try {
      console.log('=== DEBUGGING MESSAGE STRUCTURE ===')
      console.log('Full message object:', JSON.stringify(message, null, 2))
      console.log('Message display:', message.display)
      console.log('Message display type:', typeof message.display)

      // Try to synthesize a concise voice summary from known UI components
      const summarized = summarizeDisplayNode(message.display)
      if (summarized && summarized.trim().length > 0) {
        return summarized
      }

      // Handle string responses
      if (typeof message.display === 'string') {
        console.log('Found string display:', message.display)
        return message.display
      }

      // Handle React component responses
      if (message.display?.props?.children) {
        console.log('Found children, extracting...')
        const extractedText = extractTextFromChildren(message.display.props.children)
        console.log('Extracted text from children:', extractedText)
        return extractedText
      }

      // Handle direct text content
      if (message.display?.props?.content) {
        console.log('Found content prop:', message.display.props.content)
        return message.display.props.content
      }

      // Check if it's a React element with different structure
      if (message.display?.type) {
        console.log('Found React element type:', message.display.type)
        console.log('React element props:', message.display.props)
      }

      // Try to extract from any text nodes
      const fallbackText = extractTextFromAnyNode(message.display)
      console.log('Fallback extraction result:', fallbackText)

      // If still no text, try to serialize the entire object and look for text patterns
      if (!fallbackText || fallbackText.trim().length === 0) {
        const serialized = JSON.stringify(message)
        console.log('Serialized message for text search:', serialized.substring(0, 500) + '...')

        // Look for common text patterns in the serialized data
        const textMatches = serialized.match(/"([^"]{20,}[^"]*?)"/g)
        if (textMatches && textMatches.length > 0) {
          // Find the longest text match (likely to be the main content)
          const longestMatch = textMatches.reduce((a, b) => a.length > b.length ? a : b)
          const cleanText = longestMatch.replace(/^"|"$/g, '').replace(/\\"/g, '"')
          console.log('Found text via pattern matching:', cleanText)
          return cleanText
        }
      }

      return fallbackText

    } catch (error) {
      console.error('Error extracting text:', error)
      return ''
    }
  }

  // Recursively scan a React node and synthesize a concise voice summary
  const summarizeDisplayNode = (node: any): string | null => {
    if (!node || typeof node !== 'object') return null

    const typeName = node?.type?.displayName || node?.type?.name

    // AccountCards summary (by type or shape)
    if (typeName === 'AccountCards' || Array.isArray(node?.props?.props) && node?.props?.props?.[0] && (('balance' in (node.props.props[0]||{})) || ('available' in (node.props.props[0]||{})))) {
      const accounts: any[] = node?.props?.props || node?.props?.accounts || []
      if (Array.isArray(accounts) && accounts.length) {
        const totalAvailable = accounts.reduce((sum, a) => sum + (Number(a.available) || 0), 0)
        const totalCurrent = accounts.reduce((sum, a) => sum + (Number(a.balance ?? a.current) || 0), 0)
        const top = [...accounts]
          .sort((a, b) => (Number(b.available ?? b.balance ?? 0)) - (Number(a.available ?? a.balance ?? 0)))
          .slice(0, 3)
        const topStr = top.map(a => `${a.name} ${formatCurrency(a.available ?? a.balance ?? 0)}`).join(', ')
        return `You have ${accounts.length} accounts. Available is ${formatCurrency(totalAvailable)} (current ${formatCurrency(totalCurrent)}). Top accounts: ${topStr}.`
      }
    }

    // CategoryTransactions summary (by type or shape)
    if (typeName === 'CategoryTransactions' || Array.isArray(node?.props?.props?.chartDataByMonth)) {
      const data = node?.props?.props?.chartDataByMonth || []
      const filterDate = node?.props?.props?.filterDate
      if (Array.isArray(data) && data.length) {
        const top = [...data]
          .sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))
          .slice(0, 3)
        const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0)
        const span = filterDate ? ` from ${filterDate.startDate} to ${filterDate.endDate}` : ''
        const cats = top.map((c:any) => `${c.name} ${formatCurrency(c.value)}`).join(', ')
        return `Spending by category${span}: total ${formatCurrency(total)}. Top: ${cats}.`
      }
    }

    // RecurringTransactions summary (by type or shape)
    if (typeName === 'RecurringTransactions' || Array.isArray(node?.props?.props) && node?.props?.props?.[0] && ('name' in (node.props.props[0]||{}) && 'value' in (node.props.props[0]||{}))) {
      const barList = node?.props?.props || node?.props?.barListData || []
      if (Array.isArray(barList) && barList.length) {
        const top = [...barList]
          .sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))
          .slice(0, 3)
        const summary = top.map((i:any) => `${stripCount(i.name)} ${formatCurrency(i.value)} (${i.count || 0}x)`).join(', ')
        return `Top recurring spend: ${summary}.`
      }
    }

    // AccountDetail summary (by type or shape)
    if (typeName === 'AccountDetail' || (node?.props?.props && Array.isArray(node?.props?.props?.transactions)) || (node?.props?.account && Array.isArray(node?.props?.account?.transactions))) {
      const acc = node?.props?.props || node?.props?.account
      if (acc) {
        const recent = Array.isArray(acc.transactions) ? acc.transactions.slice(0, 3) : []
        const recentStr = recent.map((t:any) => `${t.name} ${formatCurrency(t.value)} on ${t.date}`).join(', ')
        return `${acc.name || 'This account'} (${acc.type || 'account'}) has ${formatCurrency(acc.balance || 0)}. Recent: ${recentStr || 'no recent transactions'}.`
      }
    }

    // Recurse into children
    const children = node?.props?.children
    if (Array.isArray(children)) {
      for (const child of children) {
        const s = summarizeDisplayNode(child)
        if (s) return s
      }
    } else if (children) {
      const s = summarizeDisplayNode(children)
      if (s) return s
    }

    return null
  }

  const stripCount = (label: string): string => (typeof label === 'string' ? label.replace(/\s*\(\d+\)\s*$/, '') : label)

  const formatCurrency = (n: number): string => {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
    } catch {
      return `$${Math.round(n).toLocaleString()}`
    }
  }

  const extractTextFromChildren = (children: any): string => {
    console.log('Extracting from children:', children, 'Type:', typeof children)

    if (typeof children === 'string') {
      console.log('Found string child:', children)
      return children
    }
    if (typeof children === 'number') return children.toString()

    if (Array.isArray(children)) {
      console.log('Processing array of children, length:', children.length)
      const texts = children.map(extractTextFromChildren).filter(Boolean)
      console.log('Extracted texts from array:', texts)
      return texts.join(' ')
    }

    if (children?.props?.children) {
      console.log('Found nested children, recursing...')
      return extractTextFromChildren(children.props.children)
    }

    // Handle text nodes and various content properties
    if (children?.props?.value) {
      console.log('Found value prop:', children.props.value)
      return children.props.value
    }
    if (children?.props?.content) {
      console.log('Found content prop:', children.props.content)
      return children.props.content
    }
    if (children?.props?.text) {
      console.log('Found text prop:', children.props.text)
      return children.props.text
    }

    // Handle React elements with text content
    if (children?.type && typeof children.type === 'string') {
      console.log('Found HTML element:', children.type)
      if (children.props?.children) {
        return extractTextFromChildren(children.props.children)
      }
    }

    console.log('No text found in child')
    return ''
  }

  const extractTextFromAnyNode = (node: any): string => {
    if (!node) return ''
    if (typeof node === 'string') return node
    if (typeof node === 'number') return node.toString()

    let text = ''

    // Try common text properties
    if (node.props) {
      if (node.props.children) text += extractTextFromChildren(node.props.children)
      if (node.props.content) text += ' ' + node.props.content
      if (node.props.value) text += ' ' + node.props.value
    }

    // Recursively search for text in nested structures
    if (typeof node === 'object') {
      Object.values(node).forEach((value: any) => {
        if (typeof value === 'string') text += ' ' + value
        else if (typeof value === 'object') text += ' ' + extractTextFromAnyNode(value)
      })
    }

    return text.trim()
  }

  const makeFriendlyVoiceResponse = (originalText: string): string => {
    // Clean up the text first
    let text = originalText.trim()

    // Remove excessive technical jargon and make it conversational
    text = text.replace(/\$\d+(\.\d{2})?/g, (match) => {
      const amount = parseFloat(match.substring(1))
      if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)} thousand dollars`
      }
      return `${amount} dollars`
    })

    // Add friendly introductions based on content type
    if (text.includes('account') || text.includes('balance')) {
      text = `Here's what I found about your finances. ${text}`
    } else if (text.includes('transaction') || text.includes('payment')) {
      text = `Let me tell you about your transactions. ${text}`
    } else if (text.includes('budget') || text.includes('spending')) {
      text = `Here's your spending summary. ${text}`
    } else if (text.includes('investment') || text.includes('portfolio')) {
      text = `Let me share your investment details. ${text}`
    }

    // Add helpful remarks and summaries
    const wordCount = text.split(' ').length
    if (wordCount > 50) {
      // For longer responses, add a summary intro
      text = `I've got some detailed information for you. ${text}`

      // Add a helpful closing remark
      const closingRemarks = [
        "Hope that helps clarify things!",
        "Let me know if you need more details on anything.",
        "Feel free to ask if you want me to explain any part further.",
        "That should give you a good overview of your situation.",
        "Is there anything specific you'd like me to dive deeper into?"
      ]
      text += ` ${closingRemarks[Math.floor(Math.random() * closingRemarks.length)]}`
    } else {
      // For shorter responses, add a friendly touch
      const friendlyIntros = [
        "Quick answer for you:",
        "Here's what I see:",
        "Let me help with that:",
        "Good question!",
        "Here you go:"
      ]
      text = `${friendlyIntros[Math.floor(Math.random() * friendlyIntros.length)]} ${text}`
    }

    // Add personality and helpful smirks
    if (text.includes('error') || text.includes('problem')) {
      text += " Don't worry, we can figure this out together!"
    } else if (text.includes('good') || text.includes('positive') || text.includes('increase')) {
      text += " That's looking pretty good!"
    } else if (text.includes('decrease') || text.includes('down') || text.includes('less')) {
      text += " Might be worth keeping an eye on that."
    }

    // Limit length for voice (aim for 30-40 seconds of speech)
    if (text.length > 400) {
      const sentences = text.split('. ')
      if (sentences.length > 3) {
        text = sentences.slice(0, 3).join('. ') + '. Check the chat for the complete details!'
      }
    }

    return text
  }

  const findAnyTextInObject = (obj: any, depth = 0): string => {
    if (depth > 10) return '' // Prevent infinite recursion

    if (typeof obj === 'string' && obj.length > 10) {
      // Filter out technical strings and keep meaningful content
      if (!obj.includes('function') && !obj.includes('React') && !obj.includes('$$')) {
        return obj
      }
    }

    if (Array.isArray(obj)) {
      for (const item of obj) {
        const text = findAnyTextInObject(item, depth + 1)
        if (text) return text
      }
    }

    if (obj && typeof obj === 'object') {
      // Prioritize certain properties that are likely to contain content
      const priorityProps = ['content', 'text', 'children', 'display', 'message', 'value']
      for (const prop of priorityProps) {
        if (obj[prop]) {
          const text = findAnyTextInObject(obj[prop], depth + 1)
          if (text) return text
        }
      }

      // Search all other properties
      for (const [key, value] of Object.entries(obj)) {
        if (!priorityProps.includes(key)) {
          const text = findAnyTextInObject(value, depth + 1)
          if (text) return text
        }
      }
    }

    return ''
  }

  const createSmartFallback = (message: any): string => {
    // Try to determine what type of response this might be based on the message structure
    const messageStr = JSON.stringify(message).toLowerCase()

    if (messageStr.includes('account') || messageStr.includes('balance')) {
      return "I've found your account information. The details are displayed in the chat above."
    } else if (messageStr.includes('transaction') || messageStr.includes('payment')) {
      return "I've retrieved your transaction history. You can see the details in the chat."
    } else if (messageStr.includes('budget') || messageStr.includes('spending')) {
      return "I've analyzed your spending patterns. Check the chat for your budget breakdown."
    } else if (messageStr.includes('investment') || messageStr.includes('portfolio')) {
      return "I've got your investment summary ready. The portfolio details are shown above."
    } else if (messageStr.includes('error') || messageStr.includes('problem')) {
      return "I encountered an issue while processing your request. Please check the chat for more information."
    } else {
      return "I've prepared a detailed response for you. Please check the chat to see the complete information."
    }
  }

  const toggleVoiceInput = () => {
    if (voiceState.isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const toggleVoiceOutput = () => {
    setIsVoiceEnabled(!isVoiceEnabled)
    if (voiceState.isSpeaking) {
      stopSpeaking()
    }
  }

  // Quick action cards
  const quickActions = [
    {
      icon: ChartBarIcon,
      title: 'Dashboard',
      description: 'View financial overview',
      action: () => onNavigate('dashboard')
    },
    {
      icon: CreditCardIcon,
      title: 'Transactions',
      description: 'See recent activity',
      action: () => onNavigate('transactions')
    },
    {
      icon: HomeIcon,
      title: 'Assets',
      description: 'Track valuable items',
      action: () => onNavigate('assets')
    },
    {
      icon: LightBulbIcon,
      title: 'Insights',
      description: 'AI recommendations',
      action: () => onNavigate('insights')
    }
  ]

  return (
    <div className={`min-h-screen relative ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Header with navigation - Original Style */}
      <div className="absolute top-4 left-4 flex gap-2">
        {/* Voice Settings button */}
        <button
          onClick={toggleVoiceOutput}
          className={`p-2 border rounded-lg transition-colors relative ${
            isVoiceEnabled
              ? 'bg-blue-600 border-blue-500 text-white'
              : isDarkMode
              ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
              : 'bg-gray-100 border-gray-300 hover:border-blue-500'
          }`}
          title={
            isVoiceEnabled
              ? `Voice Output: ON ${elevenLabsTTS.state.isConfigured && useElevenLabs ? '(Eleven Labs)' : '(Browser TTS)'}`
              : 'Enable Voice Output'
          }
        >
          <SpeakerphoneIcon className={`w-5 h-5 ${
            isVoiceEnabled ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`} />

          {/* TTS Engine Indicator - Clickable */}
          {isVoiceEnabled && elevenLabsTTS.state.isConfigured && (
            <div
              onClick={(e) => {
                e.stopPropagation()
                setUseElevenLabs(!useElevenLabs)
              }}
              className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center transition-colors cursor-pointer ${
                useElevenLabs
                  ? 'bg-purple-500 hover:bg-purple-600'
                  : 'bg-gray-400 hover:bg-gray-500'
              }`}
              title={useElevenLabs ? 'Using Eleven Labs (Click for Browser TTS)' : 'Using Browser TTS (Click for Eleven Labs)'}
            >
              <span className="text-[10px] font-bold text-white">11</span>
            </div>
          )}
        </button>

        {/* App Settings button */}
        <button
          onClick={() => onNavigate('settings')}
          className={`p-2 border rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
              : 'bg-gray-100 border-gray-300 hover:border-blue-500'
          }`}
          title="App Settings"
        >
          <CogIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </button>
      </div>

      <div className="absolute top-4 right-4 flex gap-2">
        {/* PWA Install Button */}
        <PWAInstallButtonCompact className={`border ${
          isDarkMode
            ? 'border-gray-800 hover:border-blue-500'
            : 'border-gray-300 hover:border-blue-500'
        }`} />

        {/* Theme Toggle - Hidden */}
        <button
          onClick={onToggleTheme}
          className={`hidden p-2 border rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
              : 'bg-gray-100 border-gray-300 hover:border-blue-500'
          }`}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <SunIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <MoonIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Dashboard button */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`p-2 border rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
              : 'bg-gray-100 border-gray-300 hover:border-blue-500'
          }`}
          title="Dashboard"
        >
          <ChartBarIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </button>

        {/* Transactions button */}
        <button
          onClick={() => onNavigate('transactions')}
          className={`p-2 border rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
              : 'bg-gray-100 border-gray-300 hover:border-blue-500'
          }`}
          title="Transactions"
        >
          <CreditCardIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </button>

        {/* Assets button */}
        <button
          onClick={() => onNavigate('assets')}
          className={`p-2 border rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
              : 'bg-gray-100 border-gray-300 hover:border-blue-500'
          }`}
          title="Assets"
        >
          <HomeIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </button>

        {/* Test Loan button */}
        <button
          onClick={() => setShowTestLoanModal(true)}
          className={`p-2 border rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-900/50 border-gray-800 hover:border-green-500'
              : 'bg-gray-100 border-gray-300 hover:border-green-500'
          }`}
          title="Test Loan Application"
        >
          <CurrencyDollarIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </button>

        {/* Insights button */}
        <button
          onClick={() => onNavigate('insights')}
          className={`p-2 border rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
              : 'bg-gray-100 border-gray-300 hover:border-blue-500'
          }`}
          title="AI Insights"
        >
          <LightBulbIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </button>


      </div>

      {/* Main Content */}
      <div className="flex flex-col h-screen pt-20">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <h2 className="text-xl font-semibold mb-6">How can I help you today?</h2>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`p-4 rounded-lg border transition-all hover:scale-105 ${
                      isDarkMode
                        ? 'border-gray-800 hover:border-gray-600 bg-gray-900'
                        : 'border-gray-200 hover:border-gray-400 bg-gray-50'
                    }`}
                  >
                    <action.icon className="h-8 w-8 mb-2 mx-auto text-blue-500" />
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm opacity-70">{action.description}</p>
                  </button>
                ))}
              </div>

              {/* Sample Questions */}
              <div className="mt-8 max-w-2xl w-full">
                <p className="text-center mb-4 opacity-70">Try asking:</p>
                <div className="space-y-2">
                  {[
                    `What's my account balance?`,
                    `Show me my spending trends`,
                    `Help me create a budget`,
                    `What are my recurring expenses?`
                  ].map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(question)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        isDarkMode
                          ? 'hover:bg-gray-900 border border-gray-800'
                          : 'hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      "{question}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message: any, index: number) => (
                <div key={index} className="animate-fadeIn">
                  {message.display}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Voice Status Area - Above Input */}
        <AnimatePresence>
          {(voiceState.isListening ||
            elevenLabsTTS.state.isLoading ||
            elevenLabsTTS.state.isPlaying ||
            voiceState.isSpeaking ||
            voiceState.error) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`border-t border-gray-200 dark:border-gray-800 px-4 py-3 ${
                isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50/50'
              }`}
            >
              <div className="max-w-4xl mx-auto">
                {/* Speaking Debug Strip */}
                {showTtsDebug && ttsDebug?.text && (
                  <div className={`mb-2 p-2 rounded-md text-sm flex items-start justify-between gap-3 ${
                    isDarkMode ? 'bg-purple-900/20 border border-purple-800 text-purple-200' : 'bg-purple-50 border border-purple-200 text-purple-900'
                  }`}>
                    <div className="flex-1">
                      <div className="font-medium opacity-80">Speaking ({ttsDebug.engine}):</div>
                      <div className="line-clamp-3 break-words">{ttsDebug.text}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className={`px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700 border'}`}
                        onClick={() => {
                          try {
                            navigator.clipboard.writeText(ttsDebug.text)
                          } catch {}
                        }}
                        title="Copy spoken text"
                      >
                        Copy
                      </button>
                      <button
                        className={`px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700 border'}`}
                        onClick={() => setShowTtsDebug(false)}
                        title="Hide debug strip"
                      >
                        Hide
                      </button>
                    </div>
                  </div>
                )}

                {/* Listening Status */}
                {voiceState.isListening && (
                  <div className="flex items-center justify-center gap-3 text-red-500">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <MicrophoneIcon className="h-4 w-4" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium">🎤 I{`'`}m all ears!</div>
                      <div className="text-xs opacity-75">Go ahead, ask me anything about your finances</div>
                    </div>
                  </div>
                )}

                {/* TTS Generation Status */}
                {elevenLabsTTS.state.isLoading && (
                  <div className="flex items-center justify-center gap-3 text-blue-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <div className="text-center">
                      <div className="font-medium">🎵 Crafting your answer</div>
                      <div className="text-xs opacity-75">Making it sound just right with premium AI voice</div>
                    </div>
                  </div>
                )}

                {/* TTS Playing Status */}
                {elevenLabsTTS.state.isPlaying && !elevenLabsTTS.state.isLoading && (
                  <div className="flex items-center justify-center gap-3 text-purple-500">
                    <div className="flex gap-1">
                      <div className="w-1 h-4 bg-purple-500 animate-pulse"></div>
                      <div className="w-1 h-4 bg-purple-500 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-4 bg-purple-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">🗣️ Here{`'`}s what I found</div>
                      <div className="text-xs opacity-75">Speaking with premium Eleven Labs voice</div>
                    </div>
                  </div>
                )}

                {/* Browser TTS Playing Status */}
                {voiceState.isSpeaking && !elevenLabsTTS.state.isPlaying && (
                  <div className="flex items-center justify-center gap-3 text-green-500">
                    <SpeakerphoneIcon className="h-4 w-4 animate-pulse" />
                    <div className="text-center">
                      <div className="font-medium">🔊 Here{`'`}s your answer</div>
                      <div className="text-xs opacity-75">Using built-in voice (upgrade to Eleven Labs for better quality!)</div>
                    </div>
                  </div>
                )}

                {/* Error Status */}
                {voiceState.error && (
                  <div className="flex items-center justify-center gap-3 text-red-500">
                    <div className="text-center">
                      <div className="font-medium">🎤 Voice Issue</div>
                      <div className="text-xs opacity-75 max-w-md">{voiceState.error}</div>
                      {voiceState.error.includes('denied') && (
                        <button
                          onClick={async () => {
                            const hasPermission = await checkMicrophonePermission()
                            console.log('Permission check result:', hasPermission)
                          }}
                          className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                        >
                          Check Permissions
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={voiceState.isListening ? voiceState.currentTranscript : input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(input)
                }
              }}
              placeholder={voiceState.isListening ? "Listening..." : "Type or speak your message..."}
              className={`flex-1 p-3 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-900 border-gray-800 text-white'
                  : 'bg-gray-50 border-gray-200 text-black'
              }`}
              disabled={voiceState.isListening}
            />

            {/* Voice Input Button */}
            <button
              onClick={toggleVoiceInput}
              className={`p-3 rounded-lg transition-all ${
                voiceState.isListening
                  ? 'bg-red-500 animate-pulse text-white'
                  : isDarkMode
                    ? 'bg-gray-800 hover:bg-gray-700 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-black'
              }`}
            >
              {voiceState.isListening ? (
                <StopIcon className="h-6 w-6" />
              ) : (
                <MicrophoneIcon className="h-6 w-6" />
              )}
            </button>

            {/* Send Button */}
            {!voiceState.isListening && input && (
              <button
                onClick={() => handleSendMessage(input)}
                className={`p-3 rounded-lg transition-all ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Send
              </button>
            )}
          </div>


        </div>
      </div>

      {/* PWA Status Indicator */}
      <PWAStatus />

      {/* Test Loan Application Modal */}
      <LoanApplicationModal
        isOpen={showTestLoanModal}
        onClose={() => setShowTestLoanModal(false)}
        bankName="Demo Bank"
        loanAmount={25000}
        interestRate={6.5}
        loanTerm={60}
        isDarkMode={isDarkMode}
      />
    </div>
  )
}
