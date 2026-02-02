<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  costText?: string
  tokens?: number
}>()

const tokens = computed(() => {
  return props.tokens === undefined
    ? '—'
    : new Intl.NumberFormat('en-US', {
        notation: 'compact',
      }).format(props.tokens)
})
</script>

<template>
  <div class="flex items-center space-x-2">
    <span class="text-muted-foreground">{{ tokens }}</span>
    <span v-if="props.costText" class="text-muted-foreground"
      >• {{ props.costText }}</span
    >
  </div>
</template>
