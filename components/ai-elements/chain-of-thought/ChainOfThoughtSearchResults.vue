<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const rootClasses = computed(() =>
  cn('flex items-center gap-2', attrs.class as string | string[] | undefined),
)

const restAttrs = computed(() => {
  const { class: _class, ...rest } = attrs as Record<string, unknown>
  return rest
})
</script>

<template>
  <div :class="rootClasses" v-bind="restAttrs">
    <slot />
  </div>
</template>
