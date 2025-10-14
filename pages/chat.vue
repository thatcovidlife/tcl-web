<script setup lang="ts">
definePageMeta({
  layout: 'chatbot',
})

const text = ref('')
</script>
<template>
  <div class="h-full flex flex-col justify-center items-center w-full">
    <TclPromptInput v-model="text" @submit="({ text }) => console.log(text)" />
  </div>
</template>
