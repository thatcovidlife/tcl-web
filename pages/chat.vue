<script setup lang="ts">
import { Chat } from '@ai-sdk/vue'
import { captureException } from '@sentry/nuxt'
import { toast } from 'vue-sonner'

import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import TclSuggestedPrompts from '@/components/TclSuggestedPrompts.vue'
import { defaultModel, MODELS } from '@/lib/chat/providers'

import type { modelID } from '@/lib/chat/providers'

definePageMeta({
  layout: 'chatbot',
})

const { t } = useI18n()
const user = useUserSession()

const models = computed(() => {
  return MODELS.map((model) => ({
    id: model as modelID,
    name: t(`chatbot.models.${model}`),
  }))
})

const selectedModel = ref<modelID | null>(defaultModel)

const setSelectedModel = (newModel: modelID) => {
  selectedModel.value = newModel
}

// const messages = ref<PromptInputMessage[]>([])

const chat = new Chat({
  onFinish: (message) => {
    console.log('Message finished:', message)
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

const onSubmit = async (data: PromptInputMessage) => {
  try {
    await chat.sendMessage(
      {
        text: data.text!,
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
</script>
<template>
  <div
    class="h-full flex flex-col justify-center items-center w-full max-w-3xl px-8 mx-auto"
  >
    <TclChatOverview v-if="chat.messages.length === 0" />
    <TclConversation v-else :messages="chat.messages" />
    <TclPromptInput
      :model="selectedModel"
      :models="models"
      :submit-status="chat.status"
      @submit="onSubmit"
      @update-model="setSelectedModel"
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
</template>
