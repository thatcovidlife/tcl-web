<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { HoverCard } from '@/components/ui/hover-card'

defineOptions({ inheritAttrs: false, name: 'InlineCitationCard' })

const attrs = useAttrs()

const closeDelay = computed(() => {
  const record = attrs as Record<string, unknown>
  const camel = record.closeDelay as number | undefined
  const kebab = record['close-delay'] as number | undefined
  return camel ?? kebab ?? 0
})

const openDelay = computed(() => {
  const record = attrs as Record<string, unknown>
  const camel = record.openDelay as number | undefined
  const kebab = record['open-delay'] as number | undefined
  return camel ?? kebab ?? 0
})

const restAttrs = computed(() => {
  const rest = { ...attrs } as Record<string, unknown>
  delete rest.closeDelay
  delete rest.openDelay
  delete rest['close-delay']
  delete rest['open-delay']
  return rest
})
</script>

<template>
  <HoverCard
    :close-delay="closeDelay"
    :open-delay="openDelay"
    v-bind="restAttrs"
  >
    <slot />
  </HoverCard>
</template>
