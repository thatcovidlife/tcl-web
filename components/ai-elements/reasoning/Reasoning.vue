<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  ref,
  useAttrs,
  watch,
  type HTMLAttributes,
  type Ref,
} from 'vue'
import { Collapsible } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { provideReasoning } from './reasoning-context'

defineOptions({ inheritAttrs: false, name: 'Reasoning' })

const emit = defineEmits<{
  (e: 'update:open', open: boolean): void
  (e: 'update:duration', duration: number): void
}>()

const props = withDefaults(
  defineProps<{
    isStreaming?: boolean
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
  }>(),
  {
    isStreaming: false,
    defaultOpen: true,
  },
)

const attrs = useAttrs()

const defaultOpen = computed(() => props.defaultOpen ?? true)

const isOpen = defineModel<boolean>('open')
const duration = defineModel<number>('duration', {
  default: 0,
})

const isStreaming = computed(() => props.isStreaming ?? false)

const hasAutoClosed = ref(false)
const startTime = ref<number | null>(null)
const autoCloseDelay = 1000
const msInSecond = 1000
let autoCloseTimer: ReturnType<typeof setTimeout> | null = null

if (isOpen.value === undefined) {
  isOpen.value = defaultOpen.value
}

const clearAutoCloseTimer = () => {
  if (autoCloseTimer !== null) {
    clearTimeout(autoCloseTimer)
    autoCloseTimer = null
  }
}

const scheduleAutoClose = () => {
  clearAutoCloseTimer()

  if (
    !defaultOpen.value ||
    isStreaming.value ||
    !isOpen.value ||
    hasAutoClosed.value
  ) {
    return
  }

  autoCloseTimer = setTimeout(() => {
    if (!isOpen.value) return
    isOpen.value = false
    hasAutoClosed.value = true
  }, autoCloseDelay)
}

watch(
  isStreaming,
  (streaming) => {
    if (streaming) {
      if (startTime.value === null) {
        startTime.value = Date.now()
      }
      if (!isOpen.value) {
        isOpen.value = true
      }
      clearAutoCloseTimer()
    } else {
      if (startTime.value !== null) {
        const elapsed = Date.now() - startTime.value
        duration.value = Math.ceil(elapsed / msInSecond)
        startTime.value = null
      }
      scheduleAutoClose()
    }
  },
  { immediate: true },
)

watch(isOpen, (open) => {
  props.onOpenChange?.(Boolean(open))
})

watch(
  () => [
    defaultOpen.value,
    isStreaming.value,
    isOpen.value,
    hasAutoClosed.value,
  ],
  () => {
    if (isStreaming.value) {
      clearAutoCloseTimer()
      return
    }
    scheduleAutoClose()
  },
)

provideReasoning({
  isStreaming,
  isOpen: isOpen as Ref<boolean>,
  setIsOpen: (open: boolean) => {
    isOpen.value = open
  },
  duration: duration as Ref<number>,
})

const rootClasses = computed(() =>
  cn('not-prose mb-4', attrs.class as HTMLAttributes['class']),
)

const restAttrs = computed(() => {
  const { class: _class, ...rest } = attrs as Record<string, unknown>
  return rest
})

onBeforeUnmount(clearAutoCloseTimer)

watch(duration, (value) => {
  emit('update:duration', value)
})
</script>

<template>
  <Collapsible
    v-model:open="isOpen"
    v-on:update:open="(open) => emit('update:open', open)"
    :default-open="defaultOpen"
    :class="rootClasses"
    v-bind="restAttrs"
  >
    <slot />
  </Collapsible>
</template>
