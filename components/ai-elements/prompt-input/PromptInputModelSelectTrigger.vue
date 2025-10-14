<script setup lang="ts">
import { SelectTrigger } from '@/components/ui/select'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { computed, useAttrs } from 'vue'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const attrs = useAttrs()
const triggerClass = computed(() =>
  cn(
    'border-none bg-transparent font-medium text-muted-foreground shadow-none transition-colors hover:bg-accent hover:text-foreground [&[aria-expanded="true"]]:bg-accent [&[aria-expanded="true"]]:text-foreground',
    props.class,
  ),
)
</script>

<template>
  <SelectTrigger v-bind="attrs" :class="triggerClass">
    <slot />
  </SelectTrigger>
</template>
