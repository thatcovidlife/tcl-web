<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/app/utils'

defineOptions({ inheritAttrs: false, name: 'InlineCitationQuote' })

const attrs = useAttrs()

const quoteClasses = computed(() =>
  cn(
    'border-muted text-muted-foreground border-l-2 pl-3 text-sm italic',
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
  <blockquote :class="quoteClasses" v-bind="restAttrs">
    <slot />
  </blockquote>
</template>
