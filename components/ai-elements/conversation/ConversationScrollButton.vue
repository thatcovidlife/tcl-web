<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowDownIcon } from 'lucide-vue-next'
import { computed } from 'vue'
import { useAttrs } from 'vue'

import { useConversationContext } from './conversation-context'

const props = defineProps<{
  class?: string
}>()

const attrs = useAttrs()
const { isAtBottom, scrollToBottom } = useConversationContext()
const shouldShow = computed(() => !isAtBottom.value)

function handleScrollToBottom() {
  scrollToBottom({ behavior: 'smooth' })
}
</script>

<template>
  <Button
    v-if="shouldShow"
    v-bind="attrs"
    :class="
      cn(
        'absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full',
        props.class,
      )
    "
    size="icon"
    type="button"
    variant="outline"
    @click="handleScrollToBottom"
  >
    <ArrowDownIcon class="size-4" />
  </Button>
</template>
