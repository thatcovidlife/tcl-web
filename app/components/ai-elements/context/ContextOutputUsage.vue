<script setup lang="ts">
import { estimateCost } from 'tokenlens'
import { computed } from 'vue'
import { useContext } from './context-context'
import TokensWithCost from './TokensWithCost.vue'

const { usage, modelId } = useContext()
const outputTokens = computed(() => usage?.outputTokens ?? 0)
const outputCost = computed(() =>
  modelId
    ? estimateCost({
        modelId,
        usage: { input: 0, output: outputTokens.value },
      }).totalUSD
    : undefined,
)
const outputCostText = computed(() =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(outputCost.value ?? 0),
)
</script>
<template>
  <template v-if="outputTokens > 0">
    <div class="flex items-center justify-between text-xs">
      <span class="text-muted-foreground">Output</span>
      <TokensWithCost :costText="outputCostText" :tokens="outputTokens" />
    </div>
  </template>
</template>
