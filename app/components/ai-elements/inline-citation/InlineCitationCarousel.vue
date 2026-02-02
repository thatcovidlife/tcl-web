<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { UnwrapRefCarouselApi } from '@/components/ui/carousel/interface'
import { Carousel } from '@/components/ui/carousel'
import { cn } from '@/app/utils'
import { provideInlineCitationCarousel } from './inline-citation-context'

defineOptions({ inheritAttrs: false, name: 'InlineCitationCarousel' })

const emit = defineEmits<{
  (e: 'init-api', api: UnwrapRefCarouselApi): void
}>()

const attrs = useAttrs()

const rootClasses = computed(() =>
  cn('w-full', attrs.class as string | string[] | undefined),
)

const restAttrs = computed(() => {
  const rest = { ...attrs } as Record<string, unknown>
  delete rest.class
  delete rest.onInitApi
  delete rest['on-init-api']
  return rest
})

const { api } = provideInlineCitationCarousel()

function handleInit(carouselApi: UnwrapRefCarouselApi) {
  api.value = carouselApi
  emit('init-api', carouselApi)
}
</script>

<template>
  <Carousel :class="rootClasses" v-bind="restAttrs" @init-api="handleInit">
    <slot />
  </Carousel>
</template>
