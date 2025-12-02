import { inject, provide, type Ref } from 'vue'

const CONVERSATION_CONTEXT_KEY = Symbol('ConversationContext')

export type ConversationContextValue = {
  isAtBottom: Ref<boolean>
  scrollToBottom: (options?: ScrollToOptions) => void
  registerContent: (el: HTMLElement | null) => void
}

export function provideConversationContext(value: ConversationContextValue) {
  provide(CONVERSATION_CONTEXT_KEY, value)
}

export function useConversationContext() {
  const context = inject<ConversationContextValue | null>(
    CONVERSATION_CONTEXT_KEY,
    null,
  )

  if (!context) {
    throw new Error(
      'Conversation components must be used within Conversation.vue',
    )
  }

  return context
}
