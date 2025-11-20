<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()

const emit = defineEmits(['new-chat'])
</script>
<template>
  <aside
    class="h-[calc(100vh-64px)] hidden md:block border-r-muted border-r px-4 py-6 bg-muted/25"
  >
    <TclMoreButton
      extra="w-full"
      :label="t('chatbot.new')"
      :link="localePath('/chat')"
      target="_self"
      @click="$emit('new-chat')"
    />
  </aside>
</template>
