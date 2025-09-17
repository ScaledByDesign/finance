'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'
import { useActions, useUIState } from 'ai/rsc'
import { UserMessage } from './chatui/message'
import { type AI } from '@/lib/chat/actions'
import { Button } from '@/components/ui/button'
import { Send, Mic, MicOff, Volume2, VolumeX, Plus } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useVoiceInput } from '@/lib/hooks/use-voice-input'

export function VoicePromptForm({
  input,
  setInput
}: {
  input: string
  setInput: (value: string) => void
}) {
  const router = useRouter()
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const { submitUserMessage } = useActions()
  const [_, setMessages] = useUIState<typeof AI>()

  // Voice state
  const [isVoiceEnabled, setIsVoiceEnabled] = React.useState(true) // Default to enabled
  const [isSpeaking, setIsSpeaking] = React.useState(false)

  // Voice input hook
  const {
    isListening,
    isSupported,
    transcript,
    error: voiceError,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  } = useVoiceInput()

  // Update input when transcript changes
  React.useEffect(() => {
    if (transcript && isListening) {
      setInput(transcript)
    }
  }, [transcript, isListening, setInput])

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Blur focus on mobile
    if (window.innerWidth < 600) {
      ;(e.target as any)['message']?.blur()
    }

    const value = input.trim()
    setInput('')
    if (!value) return

    // Stop listening if active
    if (isListening) {
      stopListening()
    }

    // Optimistically add user message UI
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{value}</UserMessage>
      }
    ])

    // Submit and get response message
    const responseMessage = await submitUserMessage(value)
    setMessages(currentMessages => [...currentMessages, responseMessage])

    // Auto-speak response if voice is enabled
    if (isVoiceEnabled && responseMessage.display) {
      // Small delay to ensure the response is rendered
      setTimeout(() => {
        const responseText = extractTextFromResponse(responseMessage)
        if (responseText) {
          // Clean the text for speech (remove markdown, links, etc)
          const cleanText = responseText
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
            .replace(/[#*_`]/g, '') // Remove markdown formatting
            .replace(/\n+/g, '. ') // Convert newlines to periods
            .trim()

          if (cleanText) {
            speak(cleanText)
          }
        }
      }, 500)
    }
  }

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const toggleSpeaker = () => {
    if (isSpeaking) {
      stopSpeaking()
      setIsSpeaking(false)
    } else {
      setIsVoiceEnabled(!isVoiceEnabled)
    }
  }

  // Extract text from AI response for speaking
  const extractTextFromResponse = (message: any): string => {
    try {
      // Handle string responses
      if (typeof message.display === 'string') {
        return message.display
      }

      // Handle React component responses
      if (message.display?.props) {
        return extractTextFromReactElement(message.display)
      }

      // Handle array of messages
      if (Array.isArray(message.display)) {
        return message.display.map(extractTextFromResponse).join(' ')
      }

      return ''
    } catch (error) {
      console.error('Error extracting text from response:', error)
      return ''
    }
  }

  const extractTextFromReactElement = (element: any): string => {
    if (!element) return ''

    // Handle text nodes
    if (typeof element === 'string' || typeof element === 'number') {
      return String(element)
    }

    // Handle arrays
    if (Array.isArray(element)) {
      return element.map(extractTextFromReactElement).join(' ')
    }

    // Handle React elements
    if (element.props) {
      // Special handling for known components
      const componentType = element.type?.name || element.type

      // Skip non-text components (charts, cards, etc)
      if (['AccountCard', 'Chart', 'Table', 'Button'].includes(componentType)) {
        return ''
      }

      // Extract text from BotMessage components
      if (componentType === 'BotMessage' || componentType === 'AIMessage') {
        if (element.props.content) {
          return String(element.props.content)
        }
      }

      // Recursively extract from children
      if (element.props.children) {
        return extractTextFromReactElement(element.props.children)
      }

      // Try to extract from text or content props
      if (element.props.text) return String(element.props.text)
      if (element.props.content) return String(element.props.content)
      if (element.props.message) return String(element.props.message)
    }

    return ''
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-14 sm:rounded-md sm:border sm:px-12">
        {/* New Chat Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              type="button"
              className="absolute left-2 top-[10px] sm:left-4 sm:top-[14px] h-10 w-10 sm:h-8 sm:w-8 rounded-full bg-background p-0 active:scale-95 transition-all duration-200"
              onClick={() => router.push('/dashboard/chat/new')}
            >
              <Plus className="h-4 w-4 sm:h-3 sm:w-3" />
              <span className="sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>

        {/* Text Input */}
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder={isListening ? "Listening..." : "Send a message or click the mic to speak"}
          className="min-h-[60px] w-full resize-none bg-transparent pl-4 pr-28 sm:pr-24 py-[1.3rem] focus-within:outline-none sm:text-sm"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
        />

        {/* Voice Controls */}
        <div className="absolute right-2 top-[10px] sm:right-4 sm:top-[13px] flex gap-1">
          {/* Speaker Toggle */}
          {isSupported && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant={isVoiceEnabled ? "default" : "outline"}
                  onClick={toggleSpeaker}
                  className={`
                    h-10 w-10 sm:h-8 sm:w-8
                    rounded-full
                    transition-all duration-200
                    active:scale-95
                    ${isVoiceEnabled ? 'bg-green-500 hover:bg-green-600' : ''}
                  `}
                >
                  <AnimatePresence mode="wait">
                    {isVoiceEnabled ? (
                      <motion.div
                        key="volume-on"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Volume2 className="h-4 w-4 sm:h-3 sm:w-3" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="volume-off"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <VolumeX className="h-4 w-4 sm:h-3 sm:w-3" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="sr-only">Toggle voice output</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isVoiceEnabled ? 'Disable voice output' : 'Enable voice output'}
              </TooltipContent>
            </Tooltip>
          )}

          {/* Microphone Button */}
          {isSupported && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant={isListening ? "default" : "outline"}
                  onClick={toggleVoiceInput}
                  className={`
                    h-10 w-10 sm:h-8 sm:w-8
                    rounded-full
                    transition-all duration-200
                    active:scale-95
                    ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : ''}
                  `}
                >
                  <AnimatePresence mode="wait">
                    {isListening ? (
                      <motion.div
                        key="mic-off"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <MicOff className="h-4 w-4 sm:h-3 sm:w-3" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="mic"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Mic className="h-4 w-4 sm:h-3 sm:w-3" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="sr-only">
                    {isListening ? 'Stop recording' : 'Start recording'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isListening ? 'Stop recording' : 'Start voice input'}
              </TooltipContent>
            </Tooltip>
          )}

          {/* Send Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                size="icon"
                disabled={input === ''}
                className={`
                  h-10 w-10 sm:h-8 sm:w-8
                  rounded-full
                  bg-primary hover:bg-primary/90
                  disabled:bg-muted disabled:text-muted-foreground
                  transition-all duration-200
                  active:scale-95
                  shadow-sm hover:shadow-md
                  ${input === '' ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}
                `}
              >
                <Send className="h-4 w-4 sm:h-3 sm:w-3" />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>

        {/* Voice Status Indicator */}
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500 animate-pulse"
          />
        )}

        {/* Voice Error Display */}
        {voiceError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -top-12 left-0 right-0 px-4 py-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 text-sm rounded-md"
          >
            {voiceError}
          </motion.div>
        )}
      </div>
    </form>
  )
}