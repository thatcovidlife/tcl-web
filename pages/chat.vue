<script setup lang="ts">
import { Chat } from '@ai-sdk/vue'
import { captureException } from '@sentry/nuxt'
import { toast } from 'vue-sonner'

import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import TclSuggestedPrompts from '@/components/TclSuggestedPrompts.vue'
import { defaultModel, MODELS } from '@/lib/chat/providers'
import { sanitizeChatMessage, sanitizeChatTitle } from '@/lib/utils'

import type { modelID } from '@/lib/chat/providers'

definePageMeta({
  layout: 'chatbot',
})

const { t } = useI18n()
const user = useUserSession()
const userStore = useUserStore()
const { createChat, saveMessages, retrieveChat } = useApiRoutes()

const route = useRoute()
const router = useRouter()

const conversationId = ref<string>(
  (route.query?.id as string) || crypto.randomUUID(),
)

// TODO: fix the i18n issue
const modelNames = {
  'openai/gpt-oss-120b': 'Basic',
  'zai-org/GLM-4.7': 'Pro',
}

const models = computed(() => {
  return MODELS.map((model) => ({
    id: model as modelID,
    name: modelNames[model as modelID] || model,
  }))
})

const selectedModel = ref<modelID | null>(defaultModel)

const setSelectedModel = (newModel: modelID) => {
  selectedModel.value = newModel
}

// const messages = ref<PromptInputMessage[]>([])

const chat = new Chat({
  onFinish: async (message) => {
    // Save the last two messages (user prompt + assistant response)
    const lastTwoMessages = chat.messages.slice(-2)
    const chatId =
      typeof conversationId.value === 'string'
        ? conversationId.value
        : conversationId.value?.[0]

    if (lastTwoMessages.length > 0 && chatId) {
      try {
        // Map UIMessage to the format expected by the API
        const messagesToSave = lastTwoMessages
          .map((msg) => {
            // Extract text content from parts
            const textPart = msg.parts.find((part: any) => part.type === 'text')
            const content = textPart ? (textPart as any).text : ''

            return {
              id: msg.id,
              role: msg.role,
              content,
              parts: msg.parts,
            }
          })
          .filter((msg) => msg.content && msg.content.trim().length > 0)

        if (messagesToSave.length > 0) {
          await saveMessages(chatId, messagesToSave)
        }
      } catch (error) {
        captureException(error)
        console.error('Error saving messages:', error)
      }
    }
  },
  onData: (data) => {
    console.log('Chat data:', data)
  },
  onToolCall: (toolCall) => {
    console.log('Tool call:', toolCall)
  },
  onError: (error) => {
    captureException(error)
    console.log('Chat error:', error)
    toast.error('An error occurred while processing your request.')
  },
})

// const isLoading = computed(
//   () => chat.status === 'streaming' || chat.status === 'submitted',
// )

const onNewChat = () => {
  chat.stop()
  chat.messages = []
  selectedModel.value = defaultModel
  conversationId.value = ''
}

const onSubmit = async (data: PromptInputMessage) => {
  // Sanitize the input message
  const sanitizationResult = sanitizeChatMessage(data.text)

  if (!sanitizationResult.isValid) {
    toast.error('Invalid input: ' + sanitizationResult.errors.join(', '))
    return
  }

  if (sanitizationResult.warnings.length > 0) {
    console.warn('Input warnings:', sanitizationResult.warnings)
  }

  const sanitizedText = sanitizationResult.sanitized

  if (!sanitizedText || sanitizedText.trim().length === 0) {
    toast.error('Message cannot be empty.')
    return
  }

  if (!route.query.id) {
    // Create a new chat record in the database
    if (!userStore.info?.id) {
      toast.error('You must be logged in to start a chat.')
      return
    }

    try {
      const userId = String(userStore.info.id)
      const sanitizedTitle = sanitizeChatTitle(sanitizedText)
      const result = await createChat(userId, sanitizedTitle)

      if (result?.chat?.id) {
        conversationId.value = result.chat.id
        router.replace({ query: { id: result.chat.id } })
      } else {
        toast.error('Failed to create chat session.')
        return
      }
    } catch (error) {
      captureException(error)
      console.error('Error creating chat:', error)
      toast.error('Failed to create chat session.')
      return
    }
  }

  try {
    await chat.sendMessage(
      {
        text: sanitizedText,
      },
      {
        body: {
          selectedModel: selectedModel.value,
          userId: user?.sub,
        },
      },
    )
  } catch (error) {
    captureException(error)
    console.error('Error sending message:', error)
  }
}

// Load chat history from database
const loadChatHistory = async (chatId: string) => {
  try {
    const result = await retrieveChat(chatId)

    if (result?.chat && result?.messages) {
      // Load messages into chat
      chat.messages = result.messages.map((msg: any) => ({
        id: msg.id,
        liked: (msg as any).liked ?? null,
        role: msg.role,
        parts: msg.parts || [{ type: 'text', text: msg.content }],
      }))
      conversationId.value = result.chat.id
    } else {
      // Record not found, remove query parameter
      router.replace({ query: {} })
      conversationId.value = crypto.randomUUID()
    }
  } catch (error) {
    captureException(error)
    console.error('Error loading chat:', error)
    // Remove query parameter on error
    router.replace({ query: {} })
    conversationId.value = crypto.randomUUID()
  }
}

// Watch for route query changes to load chat when navigating
watch(
  () => route.query.id,
  async (newChatId) => {
    // Only load if there's a valid chat ID and it's different from current
    if (
      newChatId &&
      typeof newChatId === 'string' &&
      newChatId !== conversationId.value
    ) {
      await loadChatHistory(newChatId)
    }
  },
)

// Load chat on page mount if id is present in route
onMounted(async () => {
  const chatId = route.query.id
  if (chatId && typeof chatId === 'string') {
    await loadChatHistory(chatId)
  }
})
</script>
<template>
  <div class="grid md:grid-cols-[70px_1fr] lg:grid-cols-[16rem_1fr] h-full">
    <TclChatSidebar @new-chat="onNewChat" />
    <div
      class="h-full max-h-[calc(100vh-64px)] flex flex-col justify-center items-center w-full max-w-3xl px-8 mx-auto"
    >
      <TclChatOverview v-if="chat.messages.length === 0" />
      <TclConversation
        v-else
        :messages="chat.messages"
        :status="chat.status"
        :chat-id="conversationId"
      />
      <TclPromptInput
        :model="selectedModel"
        :models="models"
        :submit-status="chat.status"
        @submit="onSubmit"
        @update-model="setSelectedModel"
        @stop="chat.stop()"
      />
      <TclSuggestedPrompts
        v-if="chat.messages.length === 0"
        @send-message="
          ({ e, input }) => {
            e.preventDefault()
            onSubmit(input)
          }
        "
      />
    </div>
  </div>
</template>
