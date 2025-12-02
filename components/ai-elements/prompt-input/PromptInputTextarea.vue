<script setup lang="ts">
import { InputGroupTextarea } from '@/components/ui/input-group'
import { cn } from '@/lib/utils'
import { computed, ref, watch } from 'vue'
import { useAttrs } from 'vue'

import {
  providePromptInputTextareaRef,
  useOptionalPromptInputController,
  usePromptInputAttachments,
} from './prompt-input-context'

const props = withDefaults(
  defineProps<{
    placeholder?: string
    class?: string
    modelValue?: string
  }>(),
  {
    placeholder: 'What would you like to know?',
    class: undefined,
    modelValue: undefined,
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const attrs = useAttrs()
const controller = useOptionalPromptInputController()
const attachments = usePromptInputAttachments()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
providePromptInputTextareaRef(textareaRef)

const localValue = ref(props.modelValue ?? '')

watch(
  () => props.modelValue,
  (value) => {
    if (value !== undefined) {
      localValue.value = value
    }
  },
)

const model = computed({
  get: () => (controller ? controller.textInput.value.value : localValue.value),
  set: (value: string) => {
    if (controller) {
      controller.textInput.setInput(value)
      emit('update:modelValue', value)
    } else {
      localValue.value = value
      emit('update:modelValue', value)
    }
  },
})

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter') return
  if ((event as KeyboardEvent).isComposing) return
  if (event.shiftKey) return
  event.preventDefault()
  textareaRef.value?.form?.requestSubmit()
}

function handlePaste(event: ClipboardEvent) {
  const items = event.clipboardData?.items
  if (!items) return

  const files: File[] = []
  for (const item of items) {
    if (item.kind === 'file') {
      const file = item.getAsFile()
      if (file) {
        files.push(file)
      }
    }
  }

  if (files.length > 0) {
    event.preventDefault()
    attachments.add(files)
  }
}
</script>

<template>
  <InputGroupTextarea
    v-bind="attrs"
    ref="textareaRef"
    v-model="model"
    :class="cn('field-sizing-content max-h-48 min-h-16', props.class)"
    name="message"
    :placeholder="props.placeholder"
    @keydown="handleKeydown"
    @paste="handlePaste"
  />
</template>
