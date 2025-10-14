<script setup lang="ts">
import { computed } from 'vue'
import { PERCENT_MAX } from './defaults'
import { useContext } from './context-context'
import { Progress } from '@/components/ui/progress'

const { usedTokens, maxTokens } = useContext()

const usedPercent = computed(() => usedTokens.value / maxTokens.value)
const displayPct = computed(() =>
  new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(usedPercent.value),
)
const used = computed(() =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
  }).format(usedTokens.value),
)
const total = computed(() =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
  }).format(maxTokens.value),
)

const progressValue = computed(() =>
  Math.min(usedPercent.value * 100, PERCENT_MAX),
)
</script>
<template>
  <div class="w-full space-y-2 p-3">
    <slot>
      <div class="flex items-center justify-between gap-3 text-xs">
        <p>{{ displayPct }}</p>
        <p class="font-mono text-muted-foreground">{{ used }} / {{ total }}</p>
      </div>
      <div class="space-y-2">
        <Progress class="bg-muted" :model-value="progressValue" />
      </div>
    </slot>
  </div>
</template>
