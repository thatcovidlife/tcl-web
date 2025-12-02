<script setup lang="ts">
import { computed, useAttrs, type HTMLAttributes } from 'vue'
import { CollapsibleContent } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { Response } from '../response'

defineOptions({ inheritAttrs: false, name: 'ReasoningContent' })

const attrs = useAttrs()

const contentClasses = computed(() =>
  cn(
    'mt-4 text-sm',
    'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-muted-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in',
    attrs.class as HTMLAttributes['class'],
  ),
)

const restAttrs = computed(() => {
  const { class: _class, ...rest } = attrs as Record<string, unknown>
  return rest
})
</script>

<template>
  <CollapsibleContent :class="contentClasses" v-bind="restAttrs">
    <Response class="grid gap-2">
      <slot />
    </Response>
  </CollapsibleContent>
</template>
