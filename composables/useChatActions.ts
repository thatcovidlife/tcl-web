import type { TextUIPart, UIMessage } from 'ai'
import { toast } from 'vue-sonner'
import { copyMessage } from '@/assets/utils/copy-message'
import { exportPDF } from '@/assets/utils/export-pdf'

export const useChatActions = (
  messages: Ref<(UIMessage & { liked?: boolean | null })[]>,
  messageLikes: Ref<Record<string, boolean | null>>,
) => {
  const { t } = useI18n()
  const { likeMessage, deleteLike } = useApiRoutes()

  const handleExport = async (content: string, title: string) => {
    // Implementation for exporting chat as PDF can be added here
    await exportPDF(content, title)
  }

  const handleLike = async (chatId: string, messageId: string) => {
    const result = await likeMessage(messageId, true)
    if (result) {
      messageLikes.value[messageId] = true
      toast.success(t('chatbot.actions.toasts.feedbackRecorded'), {
        description: t('chatbot.actions.toasts.like'),
      })
    } else {
      toast.error(t('chatbot.actions.toasts.feedbackError'))
    }
  }

  const handleDislike = async (chatId: string, messageId: string) => {
    const result = await likeMessage(messageId, false)
    if (result) {
      messageLikes.value[messageId] = false
      toast.success(t('chatbot.actions.toasts.feedbackRecorded'), {
        description: t('chatbot.actions.toasts.dislike'),
      })
    } else {
      toast.error(t('chatbot.actions.toasts.feedbackError'))
    }
  }

  const handleUnlike = async (chatId: string, messageId: string) => {
    const result = await deleteLike(messageId)
    if (result) {
      messageLikes.value[messageId] = null
      toast.success(t('chatbot.actions.toasts.unlike'))
    } else {
      toast.error(t('chatbot.actions.toasts.feedbackError'))
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
      toast.success(t('chatbot.actions.toasts.copy'))
    } catch (error) {
      console.error('Failed to copy message:', error)
      toast.error(t('chatbot.actions.toasts.copyError'))
    }
  }

  return {
    handleCopy,
    handleDislike,
    handleExport,
    handleLike,
    handleUnlike,
  }
}
