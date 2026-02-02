<script setup lang="ts">
import { SelectValue } from '@/components/ui/select'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/app/utils'
import { computed, useAttrs } from 'vue'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const attrs = useAttrs()
const valueClass = computed(() => cn(props.class))
</script>

<template>
  <SelectValue v-bind="attrs" :class="valueClass">
    <slot />
  </SelectValue>
</template>
