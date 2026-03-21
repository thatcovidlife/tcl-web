<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { History } from 'lucide-vue-next'

import Button from '@/components/ui/button/Button.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import Kbd from '@/components/ui/kbd/Kbd.vue'
import KbdGroup from '@/components/ui/kbd/KbdGroup.vue'
const { t } = useI18n()

const open = ref(false)

// Detect macOS for correct keyboard shortcut display
const isMac = computed(() => {
  if (import.meta.client) {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0
  }
  return false
})

// Keyboard shortcuts
const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
    if (
      (e.target instanceof HTMLElement && e.target.isContentEditable) ||
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement
    ) {
      return
    }

    e.preventDefault()
    open.value = !open.value
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button
        size="icon"
        variant="outline"
        class="w-full flex justify-start px-2 gap-1.5 items-center lg:hidden rounded-full mb-2"
      >
        <History />
      </Button>
      <Button
        variant="ghost"
        size="lg"
        class="w-full relative hidden lg:flex items-center justify-between px-2"
        @click="open = true"
      >
        <span class="flex gap-1.5 items-center"
          ><History /> {{ t('chatbot.menu.history') }}</span
        >
        <!-- <span class="inline-flex lg:hidden">Search...</span> -->
        <div class="gap-1 sm:flex">
          <KbdGroup>
            <Kbd class="border">{{ isMac ? '⌘' : 'Ctrl' }}</Kbd>
            <Kbd class="border">K</Kbd>
          </KbdGroup>
        </div>
      </Button>
    </DialogTrigger>
    <DialogContent
      class="rounded-xl border-none bg-clip-padding p-2 shadow-2xl ring-4 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-neutral-800"
    >
      <DialogHeader class="sr-only">
        <DialogTitle>{{ t('chatbot.search.title') }}</DialogTitle>
        <DialogDescription>{{
          t('chatbot.search.description')
        }}</DialogDescription>
      </DialogHeader>
      <TclChatHistoryContent :open="open" @close="open = false" />
    </DialogContent>
  </Dialog>
</template>
