<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/app/utils'

defineOptions({ inheritAttrs: false, name: 'InlineCitationText' })

const attrs = useAttrs()

const rootClasses = computed(() =>
  cn(
    'transition-colors group-hover:bg-accent',
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
