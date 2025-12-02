<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { HoverCardContent } from '@/components/ui/hover-card'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false, name: 'InlineCitationCardBody' })

const attrs = useAttrs()

const contentClasses = computed(() =>
  cn('relative w-80 p-0', attrs.class as string | string[] | undefined),
)

const restAttrs = computed(() => {
  const rest = { ...attrs } as Record<string, unknown>
  delete rest.class
  return rest
})
</script>

<template>
  <HoverCardContent :class="contentClasses" v-bind="restAttrs">
    <slot />
  </HoverCardContent>
</template>
