<script setup lang="ts">
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/app/utils'
import { useAttrs } from 'vue'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const attrs = useAttrs()
</script>

<template>
  <DropdownMenuItem v-bind="attrs" :class="cn(props.class)">
    <slot />
  </DropdownMenuItem>
</template>
