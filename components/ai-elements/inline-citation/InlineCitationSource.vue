<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false, name: 'InlineCitationSource' })

const props = defineProps<{
  title?: string
  url?: string
  description?: string
}>()

const attrs = useAttrs()

const containerClasses = computed(() =>
  cn('space-y-1', attrs.class as string | string[] | undefined),
)

const restAttrs = computed(() => {
  const rest = { ...attrs } as Record<string, unknown>
  delete rest.class
  return rest
})
</script>

<template>
  <div :class="containerClasses" v-bind="restAttrs">
    <h4 v-if="title" class="text-sm font-medium leading-tight truncate">
      {{ title }}
    </h4>
    <p v-if="url" class="text-xs text-muted-foreground break-all truncate">
      {{ url }}
    </p>
    <p
      v-if="description"
      class="text-sm text-muted-foreground leading-relaxed line-clamp-3"
    >
      {{ description }}
    </p>
    <slot />
  </div>
</template>
