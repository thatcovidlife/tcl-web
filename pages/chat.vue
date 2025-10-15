<script setup lang="ts">
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import TclSuggestedPrompts from '@/components/TclSuggestedPrompts.vue'
import { defaultModel, MODELS } from '@/lib/chat/providers'
import { cn } from '@/lib/utils'

definePageMeta({
  layout: 'chatbot',
})

const { t } = useI18n()

const models = computed(() => {
  return MODELS.map((model) => ({
    id: model,
    name: t(`chatbot.models.${model}`),
  }))
})

const model = ref<string | null>(defaultModel)

const updateModel = (newModel: string) => {
  model.value = newModel
}

const messages = ref<PromptInputMessage[]>([])
</script>
<template>
  <div
    class="h-full flex flex-col justify-center items-center w-full max-w-3xl px-8 mx-auto"
  >
    <TclChatOverview v-if="messages.length === 0" />
    <TclConversation v-else />
    <TclPromptInput
      :model="model"
      :models="models"
      :update-model="updateModel"
      @submit="(data: PromptInputMessage) => messages.push(data)"
    />
    <TclSuggestedPrompts
      v-if="messages.length === 0"
      @send-message="
        ({ e, input }) => {
          e.preventDefault()
          messages.push(input)
        }
      "
    />
  </div>
</template>
