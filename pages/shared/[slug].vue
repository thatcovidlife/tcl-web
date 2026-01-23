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
    <div v-else-if="error" class="text-center py-12 sm:py-16 px-4">
      <div
        class="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-destructive/10 mb-4"
      >
        <svg
          class="w-7 h-7 sm:w-8 sm:h-8 text-destructive"
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
      <h1 class="text-lg sm:text-xl font-semibold text-destructive mb-2">
        {{ t('chatbot.share.publicPage.notFound') }}
      </h1>
      <p class="text-sm sm:text-base text-muted-foreground mb-6 px-4">
        This share link may have expired or been removed.
      </p>
      <Button as-child variant="default" class="w-full sm:w-auto">
        <NuxtLink to="/chat">{{
          t('chatbot.share.publicPage.tryYourself')
        }}</NuxtLink>
      </Button>
    </div>

    <!-- Shared chat content -->
    <div v-else-if="data" class="space-y-6">
      <!-- Header with metadata -->
      <div class="border-b pb-6">
        <h1 class="text-xl sm:text-2xl font-bold mb-4">
          {{ data.chat.title }}
        </h1>
        <div
          class="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground"
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

        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6">
          <Button as-child size="default" class="w-full sm:w-auto">
            <NuxtLink to="/chat">{{
              t('chatbot.share.publicPage.tryYourself')
            }}</NuxtLink>
          </Button>
          <Button
            variant="outline"
            size="default"
            @click="handleCopyLink"
            class="w-full sm:w-auto"
          >
            <CopyIcon :size="16" class="mr-2" />
            {{ t('chatbot.share.copyLink') }}
          </Button>
        </div>
      </div>

      <!-- Conversation display - read-only -->
      <div class="space-y-6">
        <template v-for="message in data.messages" :key="message.id">
          <!-- User message -->
          <div v-if="message.role === 'user'" class="flex justify-end gap-3">
            <div
              class="max-w-[85%] sm:max-w-[80%] rounded-2xl bg-primary px-3 py-2.5 sm:px-4 sm:py-3 text-primary-foreground rounded-br-sm"
            >
              <p class="whitespace-pre-wrap break-words text-sm sm:text-base">
                {{
                  message.parts?.find((p: any) => p.type === 'text')?.text ||
                  message.content
                }}
              </p>
            </div>
          </div>

          <!-- Assistant message -->
          <div v-else-if="message.role === 'assistant'" class="flex gap-3">
            <div class="flex-1 space-y-4">
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
