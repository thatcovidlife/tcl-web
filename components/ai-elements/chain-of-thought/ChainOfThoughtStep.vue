<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { Component } from 'vue'
import { Dot } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  icon?: Component
  label: string
  description?: string
  status: 'complete' | 'active' | 'pending'
}>()

const attrs = useAttrs()

const statusClasses: Record<'complete' | 'active' | 'pending', string> = {
  complete: 'text-muted-foreground',
  active: 'text-foreground',
  pending: 'text-muted-foreground/50',
}

const rootClasses = computed(() =>
  cn(
    'flex gap-2 text-sm fade-in-0 slide-in-from-top-2 animate-in',
    statusClasses[props.status],
    attrs.class as string | string[] | undefined,
  ),
)

const restAttrs = computed(() => {
  const { class: _class, ...rest } = attrs as Record<string, unknown>
  return rest
})
</script>

<template>
  <div :class="rootClasses" v-bind="restAttrs">
    <div class="relative mt-0.5">
      <template v-if="props.icon">
        <component :is="props.icon" class="size-4" />
      </template>
      <template v-else>
        <Dot class="size-4" />
      </template>
      <div class="-mx-px absolute top-7 bottom-0 left-1/2 w-px bg-border" />
    </div>
    <div class="flex-1 space-y-2">
      <div>{{ props.label }}</div>
      <div v-if="props.description" class="text-muted-foreground text-xs">
        {{ props.description }}
      </div>
      <slot />
    </div>
  </div>
</template>
