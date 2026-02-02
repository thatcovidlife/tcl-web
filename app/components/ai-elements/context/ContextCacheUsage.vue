<script setup lang="ts">
import { estimateCost } from 'tokenlens'
import { computed } from 'vue'
import { useContext } from './context-context'
import TokensWithCost from './TokensWithCost.vue'

const { usage, modelId } = useContext()
const cacheTokens = computed(() => usage?.cachedInputTokens ?? 0)
const cacheCost = computed(() =>
  modelId
    ? estimateCost({
        modelId,
        usage: { input: 0, output: cacheTokens.value },
      }).totalUSD
    : undefined,
)
const cacheCostText = computed(() =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cacheCost.value ?? 0),
)
</script>
<template>
  <template v-if="cacheTokens > 0">
    <div class="flex items-center justify-between text-xs">
      <span class="text-muted-foreground">Cache</span>
      <TokensWithCost :costText="cacheCostText" :tokens="cacheTokens" />
    </div>
  </template>
</template>
