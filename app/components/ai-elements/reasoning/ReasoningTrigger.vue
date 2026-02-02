<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { Brain, ChevronDown } from 'lucide-vue-next'
import { CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/app/utils'
import { useReasoning } from './reasoning-context'

defineOptions({ inheritAttrs: false, name: 'ReasoningTrigger' })

const attrs = useAttrs()

const { isStreaming, isOpen, duration } = useReasoning()

const triggerClasses = computed(() =>
  cn(
    'flex w-full items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground',
    attrs.class as string | string[] | undefined,
  ),
)

const restAttrs = computed(() => {
  const { class: _class, ...rest } = attrs as Record<string, unknown>
  return rest
})

const thinkingMessage = computed(() => {
  if (isStreaming.value || duration.value === 0) {
    return 'Thinking...'
  }

  if (duration.value === undefined) {
    return 'Thought for a few seconds'
  }

  return `Thought for ${duration.value} seconds`
})
</script>

<template>
  <CollapsibleTrigger :class="triggerClasses" v-bind="restAttrs">
    <slot>
      <Brain class="size-4" />
      <span class="flex-1 text-left">{{ thinkingMessage }}</span>
      <ChevronDown
        :class="
          cn('size-4 transition-transform', isOpen ? 'rotate-180' : 'rotate-0')
        "
      />
    </slot>
  </CollapsibleTrigger>
</template>
