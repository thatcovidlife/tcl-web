<script setup lang="ts">
import {
  CopyIcon,
  SaveIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from 'lucide-vue-next'
import { Action, Actions } from '@/components/ai-elements/actions'

const emit = defineEmits<{
  (e: 'like', chatId: string, messageId: string): void
  (e: 'dislike', chatId: string, messageId: string): void
  (e: 'unlike', chatId: string, messageId: string): void
  (e: 'copy', chatId: string, messageId: string): void
  (e: 'export', chatId: string, messageId: string): void
}>()

const props = defineProps<{
  chatId: string
  messageId: string
  liked?: boolean | null
}>()

const { t } = useI18n()

const actions = computed(() => {
  const baseActions = []

  // Show like button only if not already liked
  if (props.liked !== true) {
    baseActions.push({
      label: t('chatbot.actions.labels.like'),
      icon: ThumbsUpIcon,
      handler: () => {
        emit('like', props.chatId, props.messageId)
      },
      tooltip: t('chatbot.actions.labels.like'),
      filled: false,
    })
  } else {
    // Show filled like button that triggers unlike
    baseActions.push({
      label: t('chatbot.actions.labels.like'),
      icon: ThumbsUpIcon,
      handler: () => {
        emit('unlike', props.chatId, props.messageId)
      },
      tooltip: t('chatbot.actions.labels.like'),
      filled: true,
    })
  }

  // Show dislike button only if not already disliked
  if (props.liked !== false) {
    baseActions.push({
      label: t('chatbot.actions.labels.dislike'),
      icon: ThumbsDownIcon,
      handler: () => {
        emit('dislike', props.chatId, props.messageId)
      },
      tooltip: t('chatbot.actions.labels.dislike'),
      filled: false,
    })
  } else {
    // Show filled dislike button that triggers unlike
    baseActions.push({
      label: t('chatbot.actions.labels.dislike'),
      icon: ThumbsDownIcon,
      handler: () => {
        emit('unlike', props.chatId, props.messageId)
      },
      tooltip: t('chatbot.actions.labels.dislike'),
      filled: true,
    })
  }

  // Always show copy and export actions
  baseActions.push(
    {
      label: t('chatbot.actions.labels.copy'),
      icon: CopyIcon,
      handler: () => {
        emit('copy', props.chatId, props.messageId)
      },
      tooltip: t('chatbot.actions.labels.copy'),
      filled: false,
    },
    {
      label: t('chatbot.actions.labels.export'),
      icon: SaveIcon,
      handler: () => {
        emit('export', props.chatId, props.messageId)
      },
      tooltip: t('chatbot.actions.labels.export'),
      filled: false,
    },
  )

  return baseActions
})
</script>
<template>
  <Actions>
    <div>{{ actions }}</div>
    <Action
      v-for="action in actions"
      :key="action.label"
      :label="action.label"
      :tooltip="action.tooltip"
      @click-action="action.handler"
    >
      <component
        :is="action.icon"
        :size="18"
        :class="{ 'fill-foreground': action.filled }"
      />
    </Action>
  </Actions>
</template>
