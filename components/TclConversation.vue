<script setup lang="ts">
import type { UIMessage } from 'ai'

defineProps<{
  messages: UIMessage[]
}>()
</script>
<template>
  <div
    class="flex-1 h-full w-full max-w-3xl space-y-4 overflow-y-auto transition-all duration-300"
  >
    {{ messages }}
  </div>
</template>
