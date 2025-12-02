<script setup lang="ts">
import { computed } from 'vue'
import { estimateCost } from 'tokenlens'
import { useContext } from './context-context'
const { modelId, usage } = useContext()

const costUSD = computed(() =>
  modelId
    ? estimateCost({
        modelId,
        usage: {
          input: usage?.inputTokens ?? 0,
          output: usage?.outputTokens ?? 0,
        },
      }).totalUSD
    : undefined,
)
const totalCost = computed(() =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(costUSD.value ?? 0),
)
</script>
<template>
  <div
    class="flex w-full items-center justify-between gap-3 bg-secondary p-3 text-xs"
  >
    <slot>
      <span class="text-muted-foreground">Total cost</span>
      <span>{{ totalCost }}</span>
    </slot>
  </div>
</template>
