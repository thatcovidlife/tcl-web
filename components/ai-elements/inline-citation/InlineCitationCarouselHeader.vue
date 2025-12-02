<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false, name: 'InlineCitationCarouselHeader' })

const attrs = useAttrs()

const headerClasses = computed(() =>
  cn(
    'flex items-center justify-between gap-2 rounded-t-md bg-secondary p-2',
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
  <div :class="headerClasses" v-bind="restAttrs">
    <slot />
  </div>
</template>
