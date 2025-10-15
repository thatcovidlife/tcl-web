<script setup lang="ts">
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import TclSuggestedPrompts from '@/components/TclSuggestedPrompts.vue'
import { defaultModel, MODELS } from '@/lib/chat/providers'

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
</script>
<template>
  <div
    class="h-full flex flex-col justify-center items-center w-full max-w-3xl px-8 mx-auto space-y-6"
  >
    <TclChatOverview />
    <TclPromptInput
      :model="model"
      :models="models"
      :update-model="updateModel"
      @submit="(data: PromptInputMessage) => console.log(data)"
    />
    <TclSuggestedPrompts />
  </div>
</template>
