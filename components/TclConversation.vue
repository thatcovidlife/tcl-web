<script setup lang="ts">
import { Search, Brain, ShieldCheck } from 'lucide-vue-next'
import lodash from 'lodash'

import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
} from '@/components/ai-elements/chain-of-thought'
import {
  Conversation,
  ConversationContent,
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

const props = defineProps<{
  messages: UIMessage[]
}>()

const { uniqBy } = lodash
const userStore = useUserStore()

// Map to store open state for each assistant message by id
const messageOpenStates = reactive<Record<string, boolean>>({})

const onOpenChange = (messageId: string, isOpen: boolean) => {
  messageOpenStates[messageId] = isOpen
}

const getOpenState = (messageId: string) => {
  return messageOpenStates[messageId] ?? true
}

const hasTextResponse = (parts: UIMessage['parts']) => {
  return parts.some((part) => part.type === 'text')
}

const avatarUrl = ref<string | null>(null)

const getHostname = (url: string) => new URL(url).hostname
const getFavicon = (url: string) =>
  `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(url)}`

const mapStep = (step: UIMessage['parts'][number], index: number) => {
  switch (step.type) {
    case 'reasoning':
      return {
        id: index,
        icon: Brain,
        status: step.state === 'done' ? 'complete' : 'active',
        label:
          step.state === 'done' ? 'Thought for a few seconds' : 'Thinking...',
        content: step.text,
      }
    case 'tool-checkContent':
      return {
        id: index,
        icon: ShieldCheck,
        status: step.state === 'output-available' ? 'complete' : 'active',
        label:
          step.state === 'output-available'
            ? 'Analysis complete'
            : 'Analyzing...',
        content:
          step.state === 'output-available'
            ? 'Validated user question against content policy.'
            : 'Validating...',
      }
    case 'tool-getInformation':
      const label =
        // @ts-expect-error
        step.input?.selectedCollection === 'lancet'
          ? 'scientific papers'
          : 'general documents'

      const results = uniqBy(
        (step.output as any[]) || [],
        'payload.metadata.url',
      ).map((result) => ({
        domain: getHostname(result.payload.metadata.url),
        favicon: getFavicon(result.payload.metadata.url),
        url: result.payload.metadata.url,
      }))

      return {
        id: index,
        icon: Search,
        status: step.state === 'output-available' ? 'complete' : 'active',
        label:
          step.state === 'output-available'
            ? 'Search complete'
            : 'Searching...',
        content:
          step.state === 'output-available'
            ? `Found ${results.length} results in ${label}.`
            : 'Digging through the archives...',
        results,
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

// Watch messages and auto-close chain of thought when text response arrives
watch(
  () => props.messages,
  (msgs) => {
    msgs.forEach((message) => {
      if (message.role === 'assistant') {
        // Auto-close when text response is present
        if (hasTextResponse(message.parts)) {
          messageOpenStates[message.id] = false
        } else {
          // Keep open if still streaming
          messageOpenStates[message.id] = true
        }
      }
    })
  },
  { deep: true },
)
</script>
<template>
  <div
    class="flex-1 h-full w-full max-w-3xl space-y-4 overflow-y-auto transition-all duration-300"
  >
    <Conversation class="relative size-full">
      <ConversationContent>
        <template v-for="message in props.messages" :key="message.id">
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
              :model-value="getOpenState(message.id)"
              @update:model-value="(isOpen) => onOpenChange(message.id, isOpen)"
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
                  <p>{{ step?.content }}</p>
                  <ChainOfThoughtSearchResults
                    v-if="step?.results && step?.results.length > 0"
                  >
                    <NuxtLink
                      :to="result.url"
                      v-for="(result, index) in step?.results"
                      :key="`cot-${message.id}-step-${step?.id}-result-${index}`"
                      target="_blank"
                    >
                      <ChainOfThoughtSearchResult>
                        <NuxtImg
                          :alt="`${result.domain} favicon`"
                          :src="result.favicon"
                          class="size-4 rounded"
                        />
                        {{ result.domain }}
                      </ChainOfThoughtSearchResult>
                    </NuxtLink>
                  </ChainOfThoughtSearchResults>
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
