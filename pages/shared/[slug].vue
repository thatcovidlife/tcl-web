<script setup lang="ts">
import { ExternalLinkIcon, CopyIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Response } from '@/components/ai-elements/response'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const slug = route.params.slug as string
const { t } = useI18n()

// Client-side URL ref (avoid SSR issues)
const currentUrl = ref('')

onMounted(() => {
  currentUrl.value = window.location.href
})

// Fetch shared chat data
const { data, pending, error } = await useFetch(`/api/chat/share/${slug}`, {
  transform: (response) => {
    // Transform messages to match UIMessage format
    return {
      ...response,
      messages: response.messages.map((msg: any) => ({
        id: msg.messageId,
        role: msg.role,
        content: msg.content,
        parts: msg.parts || [{ type: 'text', text: msg.content }],
      })),
    }
  },
})

// Set page metadata
const pageTitle = computed(() =>
  data.value?.chat.title
    ? `Shared: ${data.value.chat.title}`
    : t('chatbot.share.publicPage.title'),
)

useHead({
  title: pageTitle,
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    {
      name: 'description',
      content: `View this shared COVID-19 chat conversation`,
    },
  ],
})

const handleCopyLink = async () => {
  try {
    await navigator.clipboard.writeText(currentUrl.value)
    toast.success(t('chatbot.share.linkCopied'))
  } catch {
    toast.error('Failed to copy link')
  }
}
</script>

<template>
  <div class="container max-w-3xl mx-auto py-8 px-4 min-h-screen">
    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center items-center min-h-[300px]">
      <div class="animate-pulse text-muted-foreground">Loading...</div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-16">
      <div
        class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4"
      >
        <svg
          class="w-8 h-8 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
      <h1 class="text-xl font-semibold text-destructive mb-2">
        {{ t('chatbot.share.publicPage.notFound') }}
      </h1>
      <p class="text-muted-foreground mb-6">
        This share link may have expired or been removed.
      </p>
      <Button as-child variant="default">
        <NuxtLink to="/chat">{{
          t('chatbot.share.publicPage.tryYourself')
        }}</NuxtLink>
      </Button>
    </div>

    <!-- Shared chat content -->
    <div v-else-if="data" class="space-y-6">
      <!-- Header with metadata -->
      <div class="border-b pb-6">
        <h1 class="text-2xl font-bold mb-4">{{ data.chat.title }}</h1>
        <div
          class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
        >
          <span>
            {{
              t('chatbot.share.publicPage.sharedOn', {
                date: new Date(data.shareInfo.createdAt).toLocaleDateString(
                  undefined,
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  },
                ),
              })
            }}
          </span>
          <span>•</span>
          <span>
            {{
              t('chatbot.share.publicPage.viewCount', {
                count: data.shareInfo.viewCount,
              })
            }}
          </span>
        </div>

        <div class="flex flex-wrap gap-3 mt-6">
          <Button as-child size="default">
            <NuxtLink to="/chat">{{
              t('chatbot.share.publicPage.tryYourself')
            }}</NuxtLink>
          </Button>
          <Button variant="outline" size="default" @click="handleCopyLink">
            <CopyIcon :size="16" class="mr-2" />
            {{ t('chatbot.share.copyLink') }}
          </Button>
          <!--<Button
            variant="outline"
            size="default"
            :href="currentUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLinkIcon :size="16" class="mr-2" />
            Open
          </Button>-->
        </div>
      </div>

      <!-- Conversation display - read-only -->
      <div class="space-y-6">
        <template v-for="message in data.messages" :key="message.id">
          <!-- User message -->
          <div v-if="message.role === 'user'" class="flex justify-end gap-3">
            <div
              class="max-w-[80%] rounded-2xl bg-primary px-4 py-3 text-primary-foreground rounded-br-sm"
            >
              <p class="whitespace-pre-wrap break-words">
                {{
                  message.parts?.find((p: any) => p.type === 'text')?.text ||
                  message.content
                }}
              </p>
            </div>
          </div>

          <!-- Assistant message -->
          <div v-else-if="message.role === 'assistant'" class="flex gap-3">
            <!-- <div
              class="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow-sm"
            >
              <span class="text-sm font-bold">AI</span>
            </div> -->
            <div class="flex-1 space-y-4">
              <!-- Chain of Thought (if any) -->
              <!-- <div
                v-if="message.parts?.some((p: any) => p.type === 'reasoning')"
                class="rounded-lg border bg-muted/50 px-4 py-3 text-sm"
              >
                <div class="flex items-center gap-2 text-muted-foreground mb-2">
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <span>Thinking</span>
                </div>
                <p class="text-muted-foreground">
                  This response was generated using AI reasoning and search
                  capabilities.
                </p>
              </div> -->

              <!-- Text response -->
              <ClientOnly>
                <Response
                  v-for="(part, idx) in message.parts?.filter(
                    (p: any) => p.type === 'text',
                  )"
                  :key="idx"
                  class="mt-4 block"
                  :value="part.text"
                />
              </ClientOnly>
            </div>
          </div>
        </template>
      </div>

      <!-- Empty state -->
      <div
        v-if="data.messages.length === 0"
        class="text-center py-12 text-muted-foreground"
      >
        <p>This conversation has no messages yet.</p>
      </div>
    </div>
  </div>
</template>
