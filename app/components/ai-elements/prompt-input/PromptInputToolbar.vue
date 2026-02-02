<script setup lang="ts">
import { InputGroupAddon } from '@/components/ui/input-group'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/app/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <InputGroupAddon
    align="block-end"
    :class="cn('justify-between gap-1', props.class)"
  >
    <slot />
  </InputGroupAddon>
</template>
