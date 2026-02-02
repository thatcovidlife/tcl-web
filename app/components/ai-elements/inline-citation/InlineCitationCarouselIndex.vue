<script setup lang="ts">
import { computed, onScopeDispose, ref, useAttrs, watch } from 'vue'
import { cn } from '@/app/utils'
import { useInlineCitationCarousel } from './inline-citation-context'

defineOptions({ inheritAttrs: false, name: 'InlineCitationCarouselIndex' })

const attrs = useAttrs()

const containerClasses = computed(() =>
  cn(
    'flex flex-1 items-center justify-end px-3 py-1 text-xs text-muted-foreground',
    attrs.class as string | string[] | undefined,
  ),
)

const restAttrs = computed(() => {
  const rest = { ...attrs } as Record<string, unknown>
  delete rest.class
  return rest
})

const { api } = useInlineCitationCarousel()

const current = ref(0)
const count = ref(0)

const cleanup: Array<() => void> = []

watch(
  api,
  (instance) => {
    cleanup.forEach((fn) => fn())
    cleanup.length = 0

    if (!instance) {
      current.value = 0
      count.value = 0
      return
    }

    const updateMetrics = () => {
      const snaps = instance.scrollSnapList?.() ?? []
      count.value = snaps.length
      current.value =
        (instance.selectedScrollSnap?.() ?? 0) + (snaps.length ? 1 : 0)
    }

    const handleSelect = () => {
      current.value =
        (instance.selectedScrollSnap?.() ?? 0) + (count.value ? 1 : 0)
    }

    updateMetrics()

    instance.on?.('select', handleSelect)
    instance.on?.('reInit', updateMetrics)

    cleanup.push(() => {
      instance.off?.('select', handleSelect)
      instance.off?.('reInit', updateMetrics)
    })
  },
  { immediate: true },
)

onScopeDispose(() => {
  cleanup.forEach((fn) => fn())
})

const fallbackLabel = computed(() => `${current.value}/${count.value}`)
</script>

<template>
  <div :class="containerClasses" v-bind="restAttrs">
    <slot :count="count" :current="current">
      {{ fallbackLabel }}
    </slot>
  </div>
</template>
