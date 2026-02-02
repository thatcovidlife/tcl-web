<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { BadgeVariants } from '@/components/ui/badge'
import { Badge } from '@/components/ui/badge'
import { HoverCardTrigger } from '@/components/ui/hover-card'
import { cn } from '@/app/utils'

defineOptions({ inheritAttrs: false, name: 'InlineCitationCardTrigger' })

const props = withDefaults(
  defineProps<{
    sources?: string[]
    variant?: BadgeVariants['variant']
  }>(),
  {
    variant: 'secondary',
  },
)

const attrs = useAttrs()

const sources = computed(() => props.sources ?? [])

const badgeClasses = computed(() =>
  cn('ml-1 rounded-full', attrs.class as string | string[] | undefined),
)

const restAttrs = computed(() => {
  const rest = { ...attrs } as Record<string, unknown>
  delete rest.class
  return rest
})

const primaryHost = computed(() => {
  const first = sources.value[0]
  if (!first) {
    return undefined
  }

  try {
    return new URL(first).hostname
  } catch {
    return first
  }
})

const extraCount = computed(() => {
  const count = sources.value.length - 1
  return count > 0 ? count : 0
})
</script>

<template>
  <HoverCardTrigger :as-child="true">
    <Badge :class="badgeClasses" :variant="props.variant" v-bind="restAttrs">
      <template v-if="sources.length">
        {{ primaryHost ?? 'unknown' }}
        <span v-if="extraCount" class="ml-1">+{{ extraCount }}</span>
      </template>
      <template v-else> unknown </template>
    </Badge>
  </HoverCardTrigger>
</template>
