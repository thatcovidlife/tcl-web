<script setup lang="ts">
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import TclSuggestedPrompts from '@/components/TclSuggestedPrompts.vue'

definePageMeta({
  layout: 'chatbot',
})
</script>
<template>
  <div
    class="h-full flex flex-col justify-center items-center w-full max-w-3xl px-8 mx-auto"
  >
    <TclPromptInput @submit="(data: PromptInputMessage) => console.log(data)" />
    <TclSuggestedPrompts class="mt-6" />
  </div>
</template>
