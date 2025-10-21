<script setup lang="ts">
// import { MessageSquareIcon } from 'lucide-vue-next'

import {
  Conversation,
  ConversationContent,
  // ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import {
  Message,
  MessageAvatar,
  MessageContent,
} from '@/components/ai-elements/message'
import { Response } from '@/components/ai-elements/response'

import { useUserStore } from '@/store/user'
import { getGravatarUrl } from '@/assets/utils/gravatar'

import type { TextUIPart, UIMessage } from 'ai'

defineProps<{
  messages: UIMessage[]
}>()

const userStore = useUserStore()

const avatarUrl = ref<string | null>(null)

watch(
  () => userStore?.info?.email,
  async () => {
    avatarUrl.value = await getGravatarUrl(userStore?.info?.email || '', 128)
  },
  { immediate: true },
)
</script>
<template>
  <div
    class="flex-1 h-full w-full max-w-3xl space-y-4 overflow-y-auto transition-all duration-300"
  >
    <Conversation class="relative size-full">
      <ConversationContent>
        <!-- <ConversationEmptyState
          v-if="messages.length === 0"
          :icon="MessageSquareIcon"
          icon-class="size-6"
          title="Start a conversation"
          description="Messages will appear here as the conversation progresses."
        /> -->
        <!-- <template v-else> -->
        <!-- <Message
          v-for="(message, index) in messages"
          :key="message.id"
          :from="message.role"
        >
          <MessageContent>{{ message }}</MessageContent>
          <MessageAvatar :name="message.name" :src="message.avatar" />
        </Message> -->
        <!-- </template> -->
        <template v-for="message in messages" :key="message.id">
          <Message v-if="message.role === 'user'" from="user">
            <MessageContent class="rounded-br-none">{{
              (message.parts[0] as TextUIPart).text
            }}</MessageContent>
            <MessageAvatar
              v-if="avatarUrl"
              :name="userStore?.username || ''"
              :src="avatarUrl"
            />
          </Message>
          <template v-else-if="message.role === 'assistant'">
            <template
              v-for="(part, index) in message.parts"
              :key="`message-${message.id}-part-${index}`"
            >
              <Response
                class="mt-4 block"
                v-if="part.type === 'text'"
                :value="part.text"
              />
            </template>
          </template>
        </template>
      </ConversationContent>
      <!-- <ConversationScrollButton /> -->
    </Conversation>
  </div>
</template>
