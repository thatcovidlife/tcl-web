<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  caption?: string
}>()

const attrs = useAttrs()

const wrapperClasses = computed(() =>
  cn('mt-2 space-y-2', attrs.class as string | string[] | undefined),
)

const restAttrs = computed(() => {
  const { class: _class, ...rest } = attrs as Record<string, unknown>
  return rest
})
</script>

<template>
  <div :class="wrapperClasses" v-bind="restAttrs">
    <div
      class="relative flex max-h-[22rem] items-center justify-center overflow-hidden rounded-lg bg-muted p-3"
    >
      <slot />
    </div>
    <p v-if="props.caption" class="text-muted-foreground text-xs">
      {{ props.caption }}
    </p>
  </div>
</template>
