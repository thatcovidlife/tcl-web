<script setup lang="ts">
import { motion } from 'motion-v'
import ShadButton from './ui/button/Button.vue'

defineProps<{
  sendMessage: (e: Event, input: string) => void
}>()

const { t } = useI18n()

const suggestedActions = ref([
  {
    title: t('chatbot.suggestedPrompts.prompt1.title'),
    label: t('chatbot.suggestedPrompts.prompt1.label'),
    action: t('chatbot.suggestedPrompts.prompt1.action'),
  },
  {
    title: t('chatbot.suggestedPrompts.prompt2.title'),
    label: t('chatbot.suggestedPrompts.prompt2.label'),
    action: t('chatbot.suggestedPrompts.prompt2.action'),
  },
])

const { loggedIn } = useUserSession()
</script>
<template>
  <div data-testid="suggested-actions" class="grid sm:grid-cols-2 gap-4 w-full">
    <template
      v-for="(suggestedAction, index) in suggestedActions"
      :key="`suggested-action-${suggestedAction.title}-${index}`"
    >
      <motion.div
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: 20 }"
        :transition="{ delay: 0.05 * index }"
        :class="index > 1 ? 'hidden sm:block' : 'block'"
      >
        <ShadButton
          variant="ghost"
          class="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start hover:cursor-pointer"
          :disabled="!loggedIn"
          @click="(e: Event) => sendMessage(e, suggestedAction.action)"
        >
          <p class="font-medium">{{ suggestedAction.title }}</p>
          <p class="text-muted-foreground">
            {{ suggestedAction.label }}
          </p>
        </ShadButton>
      </motion.div>
    </template>
  </div>
</template>
