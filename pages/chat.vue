<script setup lang="ts">
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'

definePageMeta({
  layout: 'chatbot',
})
</script>
<template>
  <div class="h-full flex flex-col justify-center items-center w-full">
    <TclPromptInput @submit="(data: PromptInputMessage) => console.log(data)" />
  </div>
</template>
