<script setup lang="ts">
import { cn } from '@/app/utils'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useAttrs } from 'vue'

import { useConversationContext } from './conversation-context'

const props = defineProps<{
  class?: string
}>()

const attrs = useAttrs()
const { registerContent } = useConversationContext()
const contentRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  registerContent(contentRef.value)
})

onBeforeUnmount(() => {
  registerContent(null)
})
</script>

<template>
  <div ref="contentRef" v-bind="attrs" :class="cn('p-4', props.class)">
    <slot />
  </div>
</template>
