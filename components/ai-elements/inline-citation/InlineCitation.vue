<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false, name: 'InlineCitation' })

const attrs = useAttrs()

const rootClasses = computed(() =>
  cn(
    'group inline items-center gap-1',
    attrs.class as string | string[] | undefined,
  ),
)

const restAttrs = computed(() => {
  const rest = { ...attrs } as Record<string, unknown>
  delete rest.class
  return rest
})
</script>

<template>
  <span :class="rootClasses" v-bind="restAttrs">
    <slot />
  </span>
</template>
