<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { Button } from '@/components/ui/button'
import { HoverCardTrigger } from '@/components/ui/hover-card'
import ContextIcon from './ContextIcon.vue'
import { useContext } from './context-context'

const { usedTokens, maxTokens } = useContext()

const usedPercent = computed(() => usedTokens.value / maxTokens.value)
const renderedPercent = computed(() =>
  new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(usedPercent.value),
)

const attrs = useAttrs()
</script>
<template>
  <HoverCardTrigger asChild>
    <slot>
      <Button
        type="button"
        variant="ghost"
        class="group flex items-center gap-2"
        v-bind="attrs"
      >
        <span class="font-medium text-muted-foreground">
          {{ renderedPercent }}
        </span>
        <ContextIcon
          class="transition-opacity duration-150 group-hover:opacity-40"
        />
      </Button>
    </slot>
  </HoverCardTrigger>
</template>
