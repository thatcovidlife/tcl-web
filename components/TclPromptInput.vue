<script setup lang="ts">
import { Globe } from 'lucide-vue-next'
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

const { t } = useI18n()
const searchEnabled = ref(false)
const text = ref('')

const handleTranscriptionChange = (value: string) => {
  text.value = value
}

const toggleSearch = () => {
  searchEnabled.value = !searchEnabled.value
}
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
          <PromptInputSpeechButton
            size="sm"
            variant="ghost"
            :on-transcription-change="handleTranscriptionChange"
          />
          <PromptInputModelSelect
            :model-value="model"
            @update:modelValue="updateModel"
          >
            <PromptInputModelSelectTrigger size="sm">
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
          <PromptInputButton
            @click="toggleSearch"
            :variant="searchEnabled ? 'default' : 'ghost'"
          >
            <Globe class="size-4" />
            <span>Search</span>
          </PromptInputButton>
        </PromptInputTools>
        <PromptInputSubmit
          :status="submitStatus"
          class="rounded-full"
          :disabled="!text.trim().length"
        />
      </PromptInputToolbar>
    </PromptInput>
  </div>
</template>
