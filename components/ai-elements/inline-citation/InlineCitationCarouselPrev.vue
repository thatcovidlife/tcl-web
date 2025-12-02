<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { ArrowLeftIcon } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { useInlineCitationCarousel } from './inline-citation-context'

defineOptions({ inheritAttrs: false, name: 'InlineCitationCarouselPrev' })

const attrs = useAttrs()
const { api } = useInlineCitationCarousel()

const buttonClasses = computed(() =>
  cn('shrink-0', attrs.class as string | string[] | undefined),
)

const restAttrs = computed(() => {
  const rest = { ...attrs } as Record<string, unknown>
  delete rest.class
  return rest
})

function handleClick() {
  api.value?.scrollPrev?.()
}
</script>

<template>
  <button
    aria-label="Previous"
    type="button"
    :class="buttonClasses"
    v-bind="restAttrs"
    @click="handleClick"
  >
    <ArrowLeftIcon class="size-4 text-muted-foreground" />
  </button>
</template>
