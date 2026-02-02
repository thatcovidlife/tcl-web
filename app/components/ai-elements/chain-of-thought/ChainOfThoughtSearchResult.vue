<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/app/utils'
import { Badge } from '@/components/ui/badge'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const badgeClasses = computed(() =>
  cn(
    'gap-1 px-2 py-0.5 font-normal text-xs',
    attrs.class as string | string[] | undefined,
  ),
)

const restAttrs = computed(() => {
  const { class: _class, ...rest } = attrs as Record<string, unknown>
  return rest
})
</script>

<template>
  <Badge variant="secondary" :class="badgeClasses" v-bind="restAttrs">
    <slot />
  </Badge>
</template>
