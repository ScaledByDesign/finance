import { V2Client } from './v2-client'
import { AI } from '@/lib/chat/actions'
import { nanoid } from 'nanoid'

export default function V2Page() {
  const chatId = nanoid()

  return (
    <AI initialAIState={{ chatId, messages: [] }}>
      <V2Client chatId={chatId} />
    </AI>
  )
}