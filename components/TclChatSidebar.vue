<script setup lang="ts">
import { PenLine, SquarePen } from 'lucide-vue-next'
const localePath = useLocalePath()
const { t } = useI18n()

const emit = defineEmits(['new-chat'])
</script>
<template>
  <aside
    class="h-[calc(100vh-64px)] hidden md:flex border-r-muted border-r px-4 py-4 lg:py-6 bg-muted/25 flex-col items-stretch justify-between"
  >
    <div>
      <TclChatSearch />
      <TclChatAbout />
      <TclChatFaq />
      <NuxtLink :to="localePath('/support')" target="_blank" class="lg:hidden">
        <Button
          size="icon"
          variant="outline"
          class="w-full flex justify-start px-2 gap-1.5 items-center rounded-full mb-2"
        >
          <SquarePen />
        </Button>
      </NuxtLink>
      <NuxtLink
        :to="localePath('/support')"
        target="_blank"
        class="hidden lg:block"
      >
        <Button
          size="lg"
          variant="ghost"
          class="w-full flex justify-start px-2 gap-1.5 items-center"
        >
          <SquarePen />
          {{ t('chatbot.menu.support') }}
        </Button>
      </NuxtLink>
    </div>
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
        :label="t('chatbot.menu.new')"
        :link="localePath('/chat')"
        size="lg"
        target="_self"
        @click="$emit('new-chat')"
      />
    </div>
  </aside>
</template>
