<script setup lang="ts">
import { toRef } from 'vue'
import { HoverCard } from '@/components/ui/hover-card'

import { provideContext } from './context-context'

import type { LanguageModelUsage } from 'ai'
import type { ModelId } from 'tokenlens'

type ContextProps = {
  usedTokens: number
  maxTokens: number
  usage?: LanguageModelUsage
  modelId?: ModelId | string
}

const props = defineProps<ContextProps>()

provideContext({
  usedTokens: toRef(props.usedTokens),
  maxTokens: toRef(props.maxTokens),
  usage: props.usage,
  modelId: props.modelId,
})
</script>
<template>
  <HoverCard :close-delay="0" :open-delay="0">
    <slot />
  </HoverCard>
</template>
