<script setup lang="ts">
import { useBranch } from './branch-context'
import { cn } from '@/lib/utils'

defineProps<{
  from: 'assistant' | 'user'
}>()

const { totalBranches } = useBranch()
</script>

<template>
  <div
    v-if="totalBranches > 1"
    class="flex items-center gap-2 self-end px-10"
    :class="cn(from === 'assistant' ? 'justify-start' : 'justify-end')"
  >
    <slot />
  </div>
</template>
