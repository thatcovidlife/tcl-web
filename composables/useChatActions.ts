import type { TextUIPart, UIMessage } from 'ai'
import { copyMessage } from '@/assets/utils/copy-message'

export const useChatActions = (
  messages: Ref<(UIMessage & { liked?: boolean | null })[]>,
  messageLikes: Ref<Record<string, boolean | null>>,
) => {
  const { likeMessage, deleteLike } = useApiRoutes()

  const handleLike = async (chatId: string, messageId: string) => {
    const result = await likeMessage(messageId, true)
    if (result) {
      messageLikes.value[messageId] = true
      console.log('Like successful:', result)
    }
  }

  const handleDislike = async (chatId: string, messageId: string) => {
    const result = await likeMessage(messageId, false)
    if (result) {
      messageLikes.value[messageId] = false
      console.log('Dislike successful:', result)
    }
  }

  const handleUnlike = async (chatId: string, messageId: string) => {
    const result = await deleteLike(messageId)
    if (result) {
      messageLikes.value[messageId] = null
      console.log('Unlike successful:', result)
    }
  }

  const handleCopy = async (chatId: string, messageId: string) => {
    const message = messages.value.find((m) => m.id === messageId)
    if (!message) return

    const textPart = message.parts.find((p) => p.type === 'text') as
      | TextUIPart
      | undefined
    if (!textPart) return

    try {
      await copyMessage(textPart.text)
    } catch (error) {
      console.error('Failed to copy message:', error)
    }
  }

  return {
    handleLike,
    handleDislike,
    handleUnlike,
    handleCopy,
  }
}
