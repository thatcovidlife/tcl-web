<script setup lang="ts">
import { SelectContent } from '@/components/ui/select'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { computed, useAttrs } from 'vue'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const attrs = useAttrs()
const contentClass = computed(() => cn(props.class))
</script>

<template>
  <SelectContent v-bind="attrs" :class="contentClass">
    <slot />
  </SelectContent>
</template>
