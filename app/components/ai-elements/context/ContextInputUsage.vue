<script setup lang="ts">
import { estimateCost } from 'tokenlens'
import { computed } from 'vue'
import { useContext } from './context-context'
import TokensWithCost from './TokensWithCost.vue'

const { usage, modelId } = useContext()
const inputTokens = computed(() => usage?.inputTokens ?? 0)
const inputCost = computed(() =>
  modelId
    ? estimateCost({
        modelId,
        usage: { input: inputTokens.value, output: 0 },
      }).totalUSD
    : undefined,
)
const inputCostText = computed(() =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(inputCost.value ?? 0),
)
</script>
<template>
  <template v-if="inputTokens > 0">
    <div class="flex items-center justify-between text-xs">
      <span class="text-muted-foreground">Input</span>
      <TokensWithCost :costText="inputCostText" :tokens="inputTokens" />
    </div>
  </template>
</template>
