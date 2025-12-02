<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { CarouselItem } from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false, name: 'InlineCitationCarouselItem' })

const attrs = useAttrs()

const itemClasses = computed(() =>
  cn('w-full space-y-2 p-4 pl-8', attrs.class as string | string[] | undefined),
)

const restAttrs = computed(() => {
  const rest = { ...attrs } as Record<string, unknown>
  delete rest.class
  return rest
})
</script>

<template>
  <CarouselItem :class="itemClasses" v-bind="restAttrs">
    <slot />
  </CarouselItem>
</template>
