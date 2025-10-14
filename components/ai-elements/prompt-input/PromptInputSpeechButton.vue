<script setup lang="ts">
import type { InputGroupButtonProps as BaseInputGroupButtonProps } from '@/components/ui/input-group'
import { MicIcon } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { useAttrs } from 'vue'
import { cn } from '@/lib/utils'

import PromptInputButton from './PromptInputButton.vue'
import { useOptionalPromptInputTextareaRef } from './prompt-input-context'

type SpeechRecognitionAlternative = {
  transcript: string
  confidence: number
}

type SpeechRecognitionResult = {
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

type SpeechRecognitionResultList = {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

type SpeechRecognitionEvent = Event & {
  results: SpeechRecognitionResultList
}

type SpeechRecognitionErrorEvent = Event & {
  error: string
}

type SpeechRecognition = EventTarget & {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onstart: ((this: SpeechRecognition, ev: Event) => unknown) | null
  onend: ((this: SpeechRecognition, ev: Event) => unknown) | null
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown)
    | null
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown)
    | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognition

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

const props = defineProps<{
  textareaRef?: { value: HTMLTextAreaElement | null }
  onTranscriptionChange?: (text: string) => void
  variant?: BaseInputGroupButtonProps['variant']
  size?: BaseInputGroupButtonProps['size']
  type?: string
}>()

const attrs = useAttrs()

const injectedTextareaRef = useOptionalPromptInputTextareaRef()
const targetTextareaRef = computed(
  () => props.textareaRef ?? injectedTextareaRef ?? null,
)

const isListening = ref(false)
const recognition = shallowRef<SpeechRecognition | null>(null)
const recognitionRef = shallowRef<SpeechRecognition | null>(null)

onMounted(() => {
  if (typeof window === 'undefined') return
  const speechWindow = window as SpeechRecognitionWindow
  const SpeechRecognitionCtor =
    speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
  if (!SpeechRecognitionCtor) {
    return
  }

  const speechRecognition = new SpeechRecognitionCtor()
  speechRecognition.continuous = true
  speechRecognition.interimResults = true
  speechRecognition.lang = 'en-US'

  speechRecognition.onstart = () => {
    isListening.value = true
  }

  speechRecognition.onend = () => {
    isListening.value = false
  }

  speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
    let finalTranscript = ''
    for (let i = 0; i < event.results.length; i += 1) {
      const result = event.results.item(i)
      if (result?.isFinal) {
        const alternative = result.item(0)
        if (alternative) {
          finalTranscript += alternative.transcript
        }
      }
    }

    if (finalTranscript) {
      const textarea = targetTextareaRef.value?.value
      if (textarea) {
        const currentValue = textarea.value
        const nextValue = `${currentValue}${currentValue ? ' ' : ''}${finalTranscript}`
        textarea.value = nextValue
        // Trigger input listeners so v-model stays in sync.
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
        props.onTranscriptionChange?.(nextValue)
      }
    }
  }

  speechRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    console.error('Speech recognition error:', event.error)
    isListening.value = false
  }

  recognition.value = speechRecognition
  recognitionRef.value = speechRecognition
})

onBeforeUnmount(() => {
  recognitionRef.value?.stop()
})

const restAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const buttonClass = computed(() =>
  cn(
    'relative transition-all duration-200',
    isListening.value && 'animate-pulse bg-accent text-accent-foreground',
    attrs.class as string | undefined,
  ),
)

function toggleListening() {
  const instance = recognition.value
  if (!instance) return
  if (isListening.value) {
    instance.stop()
  } else {
    instance.start()
  }
}
</script>

<template>
  <PromptInputButton
    v-bind="restAttrs"
    :class="buttonClass"
    :disabled="!recognition"
    :size="props.size"
    :type="props.type || 'button'"
    :variant="props.variant"
    @click="toggleListening"
  >
    <slot>
      <MicIcon class="size-4" />
    </slot>
  </PromptInputButton>
</template>
