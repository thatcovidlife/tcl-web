<script setup lang="ts">
import type { InputGroupButtonProps as BaseInputGroupButtonProps } from '@/components/ui/input-group'
import { MicIcon } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { useAttrs } from 'vue'
import { cn } from '@/app/utils'
import { toast } from 'vue-sonner'

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
const hasPermissionError = ref(false)
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
    // console.log('Speech recognition result:', event.results)
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
      props.onTranscriptionChange?.(finalTranscript)
    }
  }

  speechRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    console.error('Speech recognition error:', event.error)
    isListening.value = false

    if (event.error === 'not-allowed') {
      hasPermissionError.value = true
      toast.error('Microphone access denied', {
        description:
          'Please enable microphone permissions in your browser settings and reload the page.',
        duration: 5000,
      })
    } else if (event.error === 'no-speech') {
      toast.info('No speech detected', {
        description: 'Please try speaking again.',
        duration: 3000,
      })
    } else if (event.error === 'aborted') {
      // User stopped - no need to show error
    } else {
      toast.error('Speech recognition error', {
        description: `An error occurred: ${event.error}`,
        duration: 4000,
      })
    }
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
    hasPermissionError.value && 'opacity-50',
    attrs.class as string | undefined,
  ),
)

async function toggleListening() {
  const instance = recognition.value
  if (!instance) {
    toast.error('Speech recognition not available', {
      description: 'Your browser does not support speech recognition.',
      duration: 3000,
    })
    return
  }

  if (isListening.value) {
    instance.stop()
  } else {
    // Request microphone permission explicitly before starting
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      hasPermissionError.value = false
      instance.start()
    } catch (error) {
      console.error('Microphone permission error:', error)
      hasPermissionError.value = true
      toast.error('Microphone access required', {
        description: 'Please allow microphone access to use voice input.',
        duration: 5000,
      })
    }
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
