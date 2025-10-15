<script setup lang="ts">
// import { Globe } from 'lucide-vue-next'
import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  type PromptInputStatus,
} from '@/components/ai-elements/prompt-input'

defineProps<{
  models: { id: string; name: string }[]
  model: string | null
  submitStatus: PromptInputStatus
  updateModel: (model: string) => void
}>()

const emit = defineEmits<{
  (e: 'submit', value: PromptInputMessage): void
}>()

const text = ref('')

const { t } = useI18n()
</script>
<template>
  <div class="w-full max-w-3xl">
    <PromptInput
      global-drop
      multiple
      :on-submit="(message: PromptInputMessage) => emit('submit', message)"
    >
      <PromptInputBody>
        <PromptInputAttachments>
          <template #default="{ attachment }">
            <PromptInputAttachment :data="attachment" />
          </template>
        </PromptInputAttachments>
        <PromptInputTextarea
          v-model="text"
          :placeholder="t('chatbot.input.placeholder')"
        />
      </PromptInputBody>
      <PromptInputToolbar>
        <PromptInputTools>
          <PromptInputModelSelect
            :model-value="model"
            @update:modelValue="updateModel"
          >
            <PromptInputModelSelectTrigger>
              <PromptInputModelSelectValue
                :placeholder="t('chatbot.input.selectModel')"
              />
            </PromptInputModelSelectTrigger>
            <PromptInputModelSelectContent>
              <PromptInputModelSelectItem
                v-for="modelOption in models"
                :key="modelOption.id"
                :value="modelOption.id"
              >
                {{ modelOption.name }}
              </PromptInputModelSelectItem>
            </PromptInputModelSelectContent>
          </PromptInputModelSelect>
        </PromptInputTools>
        <PromptInputSubmit :status="submitStatus" />
      </PromptInputToolbar>
    </PromptInput>
  </div>
</template>
