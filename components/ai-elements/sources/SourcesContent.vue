<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { CollapsibleContent } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false, name: 'SourcesContent' })

const attrs = useAttrs()

const contentClasses = computed(() =>
  cn(
    'mt-3 flex w-fit flex-col gap-2',
    'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 outline-none data-[state=closed]:animate-out data-[state=open]:animate-in',
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
