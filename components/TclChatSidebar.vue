<script setup lang="ts">
import { PenLine } from 'lucide-vue-next'
const localePath = useLocalePath()
const { t } = useI18n()

const emit = defineEmits(['new-chat'])
</script>
<template>
  <aside
    class="h-[calc(100vh-64px)] hidden md:flex border-r-muted border-r px-4 py-4 lg:py-6 bg-muted/25 flex-col items-stretch justify-between"
  >
    <div>&nbsp;</div>
    <div>
      <TclMoreButton
        extra="lg:hidden rounded-full"
        size="icon"
        @click="$emit('new-chat')"
      >
        <PenLine />
      </TclMoreButton>
      <TclMoreButton
        extra="w-full hidden lg:flex"
        :label="t('chatbot.new')"
        :link="localePath('/chat')"
        size="lg"
        target="_self"
        @click="$emit('new-chat')"
      />
    </div>
  </aside>
</template>
