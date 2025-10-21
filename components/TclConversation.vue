<script setup lang="ts">
// import { MessageSquareIcon } from 'lucide-vue-next'
import { Search, Brain } from 'lucide-vue-next'

import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  // ChainOfThoughtSearchResults,
  // ChainOfThoughtSearchResult,
  // ChainOfThoughtImage,
} from '@/components/ai-elements/chain-of-thought'
import {
  Conversation,
  ConversationContent,
  // ConversationEmptyState,
  // ConversationScrollButton,
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

const open = ref(true)
const onOpenChange = (isOpen: boolean) => {
  open.value = isOpen
}

const userStore = useUserStore()

const avatarUrl = ref<string | null>(null)

const mapStep = (step: UIMessage['parts'][number], index: number) => {
  switch (step.type) {
    case 'reasoning':
      return {
        id: index,
        icon: Brain,
        status: 'complete',
        label: 'Thinking...',
        content: step.text,
      }
    case 'tool-checkContent':
      return {
        id: index,
        icon: Search,
        status: 'complete',
        label: 'Searching...',
        content: 'validating content...',
      }
    case 'tool-getInformation':
      return {
        id: index,
        icon: Search,
        status: 'complete',
        label: 'Searching...',
        // @ts-expect-error
        content: `Found ${step.output?.length || 0} results in ${
          // @ts-expect-error
          step.input?.selectedCollection
        }`,
      }
    default:
      return null
  }
}

const getChainOfThought = (parts: UIMessage['parts']) => {
  return parts
    .filter((part) =>
      ['reasoning', 'tool-checkContent', 'tool-getInformation'].includes(
        part.type,
      ),
    )
    .map(mapStep)
}

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
            <ChainOfThought
              v-model="open"
              :default-open="open"
              @update:open="onOpenChange"
            >
              <ChainOfThoughtHeader />
              <ChainOfThoughtContent>
                <ChainOfThoughtStep
                  v-for="step in getChainOfThought(message.parts)"
                  :key="`cot-${message.id}-step-${step?.id}`"
                  :icon="step?.icon"
                  :status="<'pending' | 'active' | 'complete'>step?.status"
                  :label="step?.label || ''"
                >
                  {{ step?.content }}
                </ChainOfThoughtStep>
              </ChainOfThoughtContent>
            </ChainOfThought>
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
