<script setup lang="ts">
import { SelectTrigger } from '@/components/ui/select'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { computed, useAttrs } from 'vue'

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    size: 'md',
  },
)

const attrs = useAttrs()

const sizeClasses = {
  sm: 'h-8 px-2.5 text-sm',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base',
}

const triggerClass = computed(() =>
  cn(
    'border-none bg-transparent font-medium text-muted-foreground shadow-none transition-colors hover:bg-accent hover:text-foreground [&[aria-expanded="true"]]:bg-accent [&[aria-expanded="true"]]:text-foreground',
    sizeClasses[props.size],
    props.class,
  ),
)
</script>

<template>
  <SelectTrigger v-bind="attrs" :class="triggerClass" as="button">
    <slot />
  </SelectTrigger>
</template>
