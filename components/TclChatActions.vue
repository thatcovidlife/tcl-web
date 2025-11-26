<script setup lang="ts">
import {
  CopyIcon,
  ShareIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from 'lucide-vue-next'
import { Action, Actions } from '@/components/ai-elements/actions'

const actions = [
  {
    label: 'Like',
    icon: ThumbsUpIcon,
    handler: () => {
      console.log('like')
    },
    tooltip: 'I like this',
  },
  {
    label: 'Dislike',
    icon: ThumbsDownIcon,
    handler: () => {
      console.log('dislike')
    },
    tooltip: 'I dislike this',
  },
  {
    label: 'Copy',
    icon: CopyIcon,
    handler: () => {
      console.log('copy')
    },
  },
  {
    label: 'Share',
    icon: ShareIcon,
    handler: () => {
      console.log('share')
    },
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
      @click="action.handler"
    >
      <component :is="action.icon" :size="18" />
    </Action>
  </Actions>
</template>
