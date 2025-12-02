<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { CollapsibleContent } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false, name: 'ToolContent' })

const attrs = useAttrs()

const contentClasses = computed(() =>
  cn(
    'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in',
    attrs.class as string | string[] | undefined,
  ),
)

const restAttrs = computed(() => {
  const { class: _class, ...rest } = attrs as Record<string, unknown>
  return rest
})
</script>

<template>
  <CollapsibleContent :class="contentClasses" v-bind="restAttrs">
    <slot />
  </CollapsibleContent>
</template>
