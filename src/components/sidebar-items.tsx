'use client'

import { Chat } from '@/lib/types'
import { AnimatePresence, motion } from 'framer-motion'

import { removeChat, removeChatsBulk } from '@/app/actions/chat'

import { SidebarActions } from '@/components/sidebar-actions'
import { SidebarItem } from '@/components/sidebar-item'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { IconTrash } from '@/components/ui/icons'
import { toast } from 'sonner'

interface SidebarItemsProps {
  chats?: Chat[]
}

export function SidebarItems({ chats }: SidebarItemsProps) {
  const [selectMode, setSelectMode] = React.useState(false)
  const [selected, setSelected] = React.useState<Record<string, boolean>>({})

  if (!chats?.length) return null

  const toggleSelect = (id: string, checked: boolean) => {
    setSelected(prev => ({ ...prev, [id]: checked }))
  }

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {}
    for (const c of chats) if (c?.id) next[c.id] = checked
    setSelected(next)
  }

  const deleteSelected = async () => {
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k)
    if (ids.length === 0) {
      toast.info('No chats selected')
      return
    }
    try {
      await removeChatsBulk({ ids })
      toast.success(`Deleted ${ids.length} chat${ids.length > 1 ? 's' : ''}`)
      // Optimistically clear selection; page will refresh from server
      setSelected({})
    } catch (e) {
      toast.error('Failed to delete selected chats')
    }
  }

  return (
    <>
      <div className="flex items-center justify-between px-2 pb-1">
        {!selectMode ? (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectMode(true)}>
            Bulk delete
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={deleteSelected}>
              <IconTrash className="mr-1 h-3 w-3" /> Delete selected
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setSelectMode(false); setSelected({}) }}>
              Cancel
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toggleAll(true)}>
              Select all
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toggleAll(false)}>
              Clear
            </Button>
          </div>
        )}
      </div>
      <AnimatePresence>
        {chats.map(
          (chat, index) =>
            chat && (
              <motion.div
                key={chat?.id || `chat-${index}-${Date.now()}`}
                exit={{
                  opacity: 0,
                  height: 0
                }}
              >
                <SidebarItem
                  index={index}
                  chat={chat}
                  left={selectMode ? (
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-zinc-600"
                      checked={!!selected[chat.id]}
                      onChange={(e) => toggleSelect(chat.id, e.target.checked)}
                    />
                  ) : null}
                  actions={<SidebarActions chat={chat} removeChat={removeChat} />}
                />
              </motion.div>
            )
        )}
      </AnimatePresence>
    </>
  )
}
