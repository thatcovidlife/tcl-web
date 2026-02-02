<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { Brain, Link, ChevronDown } from 'lucide-vue-next'
import { cn } from '@/app/utils'
import { CollapsibleTrigger } from '@/components/ui/collapsible'
import { useChainOfThought } from './chain-of-thought-context'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const { isOpen } = useChainOfThought()

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
</script>

<template>
  <CollapsibleTrigger :class="triggerClasses" v-bind="restAttrs">
    <Link class="size-4" />
    <span class="flex-1 text-left">
      <slot>Chain of Thought</slot>
    </span>
    <ChevronDown
      :class="
        cn('size-4 transition-transform', isOpen ? 'rotate-180' : 'rotate-0')
      "
    />
  </CollapsibleTrigger>
</template>
