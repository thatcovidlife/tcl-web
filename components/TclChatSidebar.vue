<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()
</script>
<template>
  <aside
    class="h-[calc(100vh-64px)] hidden md:block border-r-muted border-r px-4 py-6 bg-muted/25"
  >
    <TclMoreButton
      extra="w-full rounded-full"
      :label="t('chatbot.new')"
      :link="localePath('/chat')"
      target="_self"
    />
  </aside>
</template>
