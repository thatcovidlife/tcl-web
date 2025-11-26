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
  (e: 'copy', chatId: string, messageId: string): void
  (e: 'export', chatId: string, messageId: string): void
}>()

const props = defineProps<{
  chatId: string
  messageId: string
}>()

const { t } = useI18n()

const actions = [
  {
    label: t('chatbot.actions.labels.like'),
    icon: ThumbsUpIcon,
    handler: () => {
      emit('like', props.chatId, props.messageId)
    },
    tooltip: t('chatbot.actions.labels.like'),
  },
  {
    label: t('chatbot.actions.labels.dislike'),
    icon: ThumbsDownIcon,
    handler: () => {
      emit('dislike', props.chatId, props.messageId)
    },
    tooltip: t('chatbot.actions.labels.dislike'),
  },
  {
    label: t('chatbot.actions.labels.copy'),
    icon: CopyIcon,
    handler: () => {
      emit('copy', props.chatId, props.messageId)
    },
    tooltip: t('chatbot.actions.labels.copy'),
  },
  {
    label: t('chatbot.actions.labels.export'),
    icon: SaveIcon,
    handler: () => {
      emit('export', props.chatId, props.messageId)
    },
    tooltip: t('chatbot.actions.labels.export'),
  },
]
</script>
<template>
  <Actions>
    <Action
      v-for="action in actions"
      :key="action.label"
      :label="action.label"
      :tooltip="action.tooltip"
      @click-action="action.handler"
    >
      <component :is="action.icon" :size="18" />
    </Action>
  </Actions>
</template>
