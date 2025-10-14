<script setup lang="ts">
import { estimateCost } from 'tokenlens'
import { computed } from 'vue'
import { useContext } from './context-context'
import TokensWithCost from './TokensWithCost.vue'

const { usage, modelId } = useContext()
const reasoningTokens = computed(() => usage?.reasoningTokens ?? 0)
const reasoningCost = computed(() =>
  modelId
    ? estimateCost({
        modelId,
        usage: { input: 0, output: reasoningTokens.value },
      }).totalUSD
    : undefined,
)
const reasoningCostText = computed(() =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(reasoningCost.value ?? 0),
)
</script>
<template>
  <template v-if="reasoningTokens > 0">
    <div class="flex items-center justify-between text-xs">
      <span class="text-muted-foreground">Reasoning</span>
      <TokensWithCost :costText="reasoningCostText" :tokens="reasoningTokens" />
    </div>
  </template>
</template>
