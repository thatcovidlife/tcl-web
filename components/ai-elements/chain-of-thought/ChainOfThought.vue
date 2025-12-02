<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { Collapsible } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { provideChainOfThought } from './chain-of-thought-context'

defineOptions({ inheritAttrs: false })

const emit = defineEmits<{
  (e: 'update:open', open: boolean): void
}>()

defineProps<{
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}>()

const attrs = useAttrs()
const isOpen = defineModel<boolean>({
  default: true,
})

provideChainOfThought({
  isOpen,
})

const rootClasses = computed(() =>
  cn(
    'not-prose max-w-prose space-y-4',
    attrs.class as string | string[] | undefined,
  ),
)

const restAttrs = computed(() => {
  const { class: _class, ...rest } = attrs as Record<string, unknown>
  return rest
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
