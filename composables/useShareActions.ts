import { toast } from 'vue-sonner'

export const useShareActions = () => {
  const { t } = useI18n()

  /**
   * Creates a share link for a chat
   * @param chatId - The ID of the chat to share
   * @param expiresAt - Optional expiration date (ISO string)
   * @returns The share response with slug and URL, or null on failure
   */
  const createShareLink = async (
    chatId: string,
    expiresAt?: string,
  ): Promise<{
    slug: string
    shareUrl: string
    expiresAt: string | null
  } | null> => {
    try {
      const response = await $fetch<{
        slug: string
        shareUrl: string
        expiresAt: string | null
      }>('/api/chat/share', {
        method: 'POST',
        body: { chatId, expiresAt },
      })

      toast.success(t('chatbot.share.toasts.created'))
      return response
    } catch (error) {
      console.error('Failed to create share link:', error)
      toast.error(t('chatbot.share.toasts.error'))
      return null
    }
  }

  /**
   * Copies text to clipboard
   * @param text - The text to copy
   */
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(t('chatbot.share.linkCopied'))
      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      toast.error('Failed to copy to clipboard')
      return false
    }
  }

  return {
    copyToClipboard,
    createShareLink,
  }
}
