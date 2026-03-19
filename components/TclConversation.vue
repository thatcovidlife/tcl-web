<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
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
import { useI18n } from 'vue-i18n'
import { getGravatarUrl } from '@/assets/utils/gravatar'
import { useChatActions } from '@/composables/useChatActions'
import { decodeHtmlEntities } from '@/lib/utils'

import type { TextUIPart, UIMessage } from 'ai'
import type { ChatStatus } from 'ai'

const props = defineProps<{
  chatId: string
  messages: (UIMessage & { liked?: boolean | null })[]
  status: ChatStatus
}>()

const emit = defineEmits<{
  (e: 'share'): void
}>()

const breakpoints = useBreakpoints(breakpointsTailwind)

// Store like states for messages
const messageLikes = ref<Record<string, boolean | null>>({})

const { uniqBy } = lodash
const { t } = useI18n()
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

const getHostname = (url: string) => {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

const getFavicon = (url: string) =>
  `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(url)}`

// Resolve the URL from a Qdrant result payload.
// New ingestion stores url flat in payload (payload.url).
// Legacy ingestion stored it nested (payload.metadata.url).
const resolveUrl = (result: any): string | null =>
  result?.payload?.url ?? result?.payload?.metadata?.url ?? null

const mapStep = (step: UIMessage['parts'][number], index: number) => {
  switch (step.type) {
    case 'reasoning':
      return {
        id: index,
        icon: Brain,
        status: step.state === 'done' ? 'complete' : 'active',
        label:
          step.state === 'done'
            ? t('chatbot.chainOfThought.reasoning.done')
            : t('chatbot.chainOfThought.reasoning.active'),
        content: step.text,
      }
    case 'tool-checkContent':
      return {
        id: index,
        icon: ShieldCheck,
        status: step.state === 'output-available' ? 'complete' : 'active',
        label:
          step.state === 'output-available'
            ? t('chatbot.chainOfThought.contentCheck.done')
            : t('chatbot.chainOfThought.contentCheck.active'),
        content:
          step.state === 'output-available'
            ? t('chatbot.chainOfThought.contentCheck.doneContent')
            : t('chatbot.chainOfThought.contentCheck.activeContent'),
      }
    case 'tool-getInformation': {
      const label =
        // @ts-expect-error
        step.input?.selectedCollection === 'lancet'
          ? t('chatbot.chainOfThought.search.sourceScientific')
          : t('chatbot.chainOfThought.search.sourceGeneral')

      const results = uniqBy((step.output as any[]) || [], (result: any) =>
        resolveUrl(result),
      )
        // Drop results with no resolvable URL — avoids crashing getHostname/getFavicon
        .filter((result: any) => !!resolveUrl(result))
        .map((result: any) => {
          const url = resolveUrl(result)!
          return {
            domain: getHostname(url),
            favicon: getFavicon(url),
            url,
          }
        })

      return {
        id: index,
        icon: Search,
        status: step.state === 'output-available' ? 'complete' : 'active',
        label:
          step.state === 'output-available'
            ? t('chatbot.chainOfThought.search.done')
            : t('chatbot.chainOfThought.search.active'),
        content:
          step.state === 'output-available'
            ? t('chatbot.chainOfThought.search.doneContent', {
                count: results.length,
                source: label,
              })
            : t('chatbot.chainOfThought.search.activeContent'),
        results,
      }
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

const firstUserQuestion = computed(() => {
  const firstUser = props.messages.find((m) => m.role === 'user')
  if (!firstUser) return ''
  const text = decodeHtmlEntities((firstUser.parts[0] as TextUIPart).text)
  return text.length > 55 ? text.slice(0, 55) + '...' : text
})

const { handleLike, handleDislike, handleUnlike, handleCopy, handleExport } =
  useChatActions(toRef(props, 'messages'), messageLikes)

watch(
  () => userStore?.info?.email,
  async () => {
    avatarUrl.value = await getGravatarUrl(userStore?.info?.email || '', 128)
  },
  { immediate: true },
)

// Initialize messageLikes from messages when they are loaded
watch(
  () => props.messages,
  (msgs) => {
    msgs.forEach((message) => {
      if (message.role === 'assistant') {
        // Initialize like state from message data if available
        if (
          'liked' in message &&
          messageLikes.value[message.id] === undefined
        ) {
          messageLikes.value[message.id] = (message as any).liked ?? null
        }

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
  { deep: true, immediate: true },
)
</script>
<template>
  <div
    class="flex-1 h-full w-full max-w-3xl space-y-4 overflow-y-auto transition-all duration-300"
  >
    <Conversation class="relative size-full">
      <div
        class="flex justify-end py-2 sticky top-0 z-10 bg-background/80 backdrop-blur-sm"
      >
        <TclShareDialog
          v-if="
            props.messages.length > 0 &&
            props.status === 'ready' &&
            breakpoints.isGreaterOrEqual('md')
          "
          :chat-id="props.chatId"
          :chat-title="firstUserQuestion"
          class="hidden md:flex"
          @created="emit('share')"
        />
        <TclChatActionMenu v-else />
      </div>
      <ConversationContent>
        <template v-for="message in props.messages" :key="message.id">
          <Message v-if="message.role === 'user'" from="user">
            <MessageContent class="rounded-br-none">{{
              decodeHtmlEntities((message.parts[0] as TextUIPart).text)
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
              <ChainOfThoughtHeader
                :title="t('chatbot.chainOfThought.title')"
              />
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
              <template v-if="part.type === 'text'">
                <Response class="mt-4 block" :value="part.text" />
                <TclChatActions
                  v-if="props.status === 'ready'"
                  class="my-2"
                  :chat-id="props.chatId"
                  :message-id="message.id"
                  :liked="messageLikes[message.id]"
                  @like="handleLike"
                  @dislike="handleDislike"
                  @unlike="handleUnlike"
                  @copy="handleCopy"
                  @export="
                    () =>
                      handleExport(
                        part.text,
                        (
                          props.messages[props.messages.indexOf(message) - 1]
                            ?.parts[0] as TextUIPart
                        )?.text || 'export',
                        `chat-message-${message.id}`,
                      )
                  "
                />
              </template>
            </template>
          </template>
        </template>
      </ConversationContent>
      <!-- <ConversationScrollButton /> -->
    </Conversation>
  </div>
</template>
