# Chat Sharing Functionality - Implementation Plan

## Overview

This document provides a clear implementation plan for adding sharing functionality to the chatbot, allowing users to create shareable links for their conversations and enabling public access to shared chats.

## Current Architecture Summary

### Database Schema ([lib/db/schema/index.ts](lib/db/schema/index.ts))

**Existing tables:**
- `users` - User accounts (id, email, role, active)
- `profiles` - User profiles (id, name, bio, website, userId, language, theme)
- `chats` - Chat sessions (id, createdAt, userId, title)
- `messages` - Chat messages (id, createdAt, chatId, messageId, content, role, parts)
- `likes` - Message feedback (id, createdAt, messageId, userId, like)

**ORM:** Drizzle ORM with PostgreSQL
**Pattern:** Cascade deletes configured on foreign keys

### API Patterns ([server/api/chat/retrieve.get.ts](server/api/chat/retrieve.get.ts))

**Authentication:**
```typescript
const { user: sessionUser } = await getUserSession(event)
```

**Ownership verification:**
```typescript
if (chat.userId !== dbUser.id) {
  throw createError({ status: 403, message: 'Forbidden' })
}
```

**Error handling:**
- Sentry spans for database queries
- `consola` for logging
- Proper error re-throwing for `createError` instances

### UI Components

- **[TclChatActions.vue](components/TclChatActions.vue)** - Per-message actions (like, dislike, copy, export)
- **[useChatActions.ts](composables/useChatActions.ts)** - Action handlers with toast notifications
- **[TclConversation.vue](components/TclConversation.vue)** - Displays conversation messages
- **[TclChatSidebar.vue](components/TclChatSidebar.vue)** - Chat history sidebar

**Important:** Share functionality should be at the **chat/conversation level**, not per-message.

### Available Dependencies

- `nanoid` - Already in project for slug generation
- `drizzle-orm` - Database ORM
- `@nuxtjs/sanity` - CMS integration
- `vue-sonner` - Toast notifications
- `@iconify/vue` (Lucide icons) - Icon library

---

## Implementation Steps

### Phase 1: Database & Core API

#### Step 1.1: Add `sharedChats` table to schema

**File:** [lib/db/schema/index.ts](lib/db/schema/index.ts)

Add the following after the `likes` table:

```typescript
export const sharedChats = pgTable(
  'shared_chat',
  {
    id: uuid('id')
      .notNull()
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
    chatId: uuid('chat_id')
      .notNull()
      .references(() => chats.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    expiresAt: timestamp('expires_at'), // null = never expires
    viewCount: integer('view_count').default(0).notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [
    foreignKey({
      columns: [table.chatId],
      foreignColumns: [chats.id],
      name: 'shared_chat_chat_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: 'shared_chat_user_fkey',
    }).onDelete('cascade'),
  ],
)
```

**Field descriptions:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Unique identifier for the share record |
| `createdAt` | timestamp | When the share link was created |
| `chatId` | uuid | Reference to the original chat (cascade delete) |
| `slug` | varchar(255) | URL-friendly unique identifier for public access |
| `expiresAt` | timestamp | Optional expiration date (null = permanent) |
| `viewCount` | integer | Track how many times the shared chat was viewed |
| `createdBy` | uuid | User who created the share link |

#### Step 1.2: Generate and run migration

```bash
yarn db:generate  # Creates migration file in drizzle/
yarn db:migrate   # Applies migration to database
```

#### Step 1.3: Create share endpoint

**File:** `server/api/chat/share.create.post.ts`

```typescript
import { consola } from 'consola'
import { nanoid } from 'nanoid'
import { db } from '@/lib/db'
import { sharedChats, chats, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import * as Sentry from '@sentry/nuxt'

export default defineEventHandler(async (event) => {
  // Validate user authentication
  const { user: sessionUser } = await getUserSession(event)

  if (!sessionUser) {
    throw createError({
      status: 401,
      message: 'Unauthorized',
      statusMessage: 'You must be logged in to create share links',
    })
  }

  try {
    const body = await readBody(event)
    const { chatId, expiresAt } = body

    if (!chatId) {
      throw createError({
        status: 400,
        message: 'Bad request',
        statusMessage: 'Chat ID is required',
      })
    }

    // Get the user ID from the database using the email
    const [dbUser] = await Sentry.startSpan(
      {
        name: 'get user by email',
        op: 'database.query',
      },
      async () => {
        return await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, sessionUser.email))
          .limit(1)
      },
    )

    if (!dbUser) {
      throw createError({
        status: 404,
        message: 'Not found',
        statusMessage: 'User not found in database',
      })
    }

    // Verify chat ownership
    const [chat] = await Sentry.startSpan(
      {
        name: 'get chat by id',
        op: 'database.query',
      },
      async () => {
        return await db
          .select({ userId: chats.userId })
          .from(chats)
          .where(eq(chats.id, chatId))
          .limit(1)
      },
    )

    if (!chat) {
      throw createError({
        status: 404,
        message: 'Not found',
        statusMessage: 'Chat not found',
      })
    }

    if (chat.userId !== dbUser.id) {
      throw createError({
        status: 403,
        message: 'Forbidden',
        statusMessage: 'You do not have permission to share this chat',
      })
    }

    // Generate unique slug (12 characters = ~72 bits of entropy)
    const slug = nanoid(12)

    // Calculate expiration date if provided
    let expiresAtDate: Date | null = null
    if (expiresAt) {
      expiresAtDate = new Date(expiresAt)
      // Validate expiration is in the future
      if (expiresAtDate <= new Date()) {
        throw createError({
          status: 400,
          message: 'Bad request',
          statusMessage: 'Expiration date must be in the future',
        })
      }
    }

    // Create the share link
    const [sharedChat] = await Sentry.startSpan(
      {
        name: 'create shared chat',
        op: 'database.query',
      },
      async () => {
        return await db
          .insert(sharedChats)
          .values({
            chatId,
            slug,
            expiresAt: expiresAtDate,
            createdBy: dbUser.id,
          })
          .returning()
      },
    )

    consola.success(`Created share link for chat ${chatId}`)

    return {
      slug: sharedChat.slug,
      shareUrl: `/shared/${sharedChat.slug}`,
      expiresAt: sharedChat.expiresAt,
    }
  } catch (error) {
    consola.error('Error creating share link:', error)

    // Re-throw if it's already a createError error
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    Sentry.captureException(error)

    throw createError({
      status: 500,
      message: 'Internal server error',
      statusMessage: 'Failed to create share link',
    })
  }
})
```

#### Step 1.4: Create public retrieve endpoint

**File:** `server/api/chat/share/[slug].get.ts`

```typescript
import { consola } from 'consola'
import { db } from '@/lib/db'
import { sharedChats, chats, messages } from '@/lib/db/schema'
import { eq, and, or, isNull, gt, asc } from 'drizzle-orm'
import * as Sentry from '@sentry/nuxt'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Slug is required',
    })
  }

  try {
    // Fetch the shared chat with expiration check
    const result = await Sentry.startSpan(
      {
        name: 'get shared chat by slug',
        op: 'database.query',
      },
      async () => {
        return await db
          .select({
            id: sharedChats.id,
            slug: sharedChats.slug,
            createdAt: sharedChats.createdAt,
            expiresAt: sharedChats.expiresAt,
            viewCount: sharedChats.viewCount,
            chat: {
              id: chats.id,
              title: chats.title,
              createdAt: chats.createdAt,
            },
          })
          .from(sharedChats)
          .innerJoin(chats, eq(sharedChats.chatId, chats.id))
          .where(
            and(
              eq(sharedChats.slug, slug),
              or(
                isNull(sharedChats.expiresAt),
                gt(sharedChats.expiresAt, new Date()),
              ),
            ),
          )
          .limit(1)
      },
    )

    const [sharedChat] = result

    if (!sharedChat) {
      throw createError({
        status: 404,
        message: 'Not found',
        statusMessage: 'Shared chat not found or has expired',
      })
    }

    // Increment view count
    await Sentry.startSpan(
      {
        name: 'increment view count',
        op: 'database.query',
      },
      async () => {
        await db
          .update(sharedChats)
          .set({ viewCount: sharedChat.viewCount + 1 })
          .where(eq(sharedChats.id, sharedChat.id))
      },
    )

    // Fetch all messages for this chat
    const chatMessages = await Sentry.startSpan(
      {
        name: 'get chat messages',
        op: 'database.query',
      },
      async () => {
        return await db
          .select({
            messageId: messages.messageId,
            role: messages.role,
            content: messages.content,
            parts: messages.parts,
          })
          .from(messages)
          .where(eq(messages.chatId, sharedChat.chat.id))
          .orderBy(asc(messages.createdAt))
      },
    )

    consola.success(
      `Retrieved shared chat ${slug} with ${chatMessages.length} messages`,
    )

    return {
      chat: {
        id: sharedChat.chat.id,
        title: sharedChat.chat.title,
        createdAt: sharedChat.chat.createdAt,
      },
      messages: chatMessages,
      shareInfo: {
        slug: sharedChat.slug,
        createdAt: sharedChat.createdAt,
        expiresAt: sharedChat.expiresAt,
        viewCount: sharedChat.viewCount + 1,
      },
    }
  } catch (error) {
    consola.error('Error retrieving shared chat:', error)

    // Re-throw if it's already a createError error
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    Sentry.captureException(error)

    throw createError({
      status: 500,
      message: 'Internal server error',
      statusMessage: 'Failed to retrieve shared chat',
    })
  }
})
```

---

### Phase 2: UI Integration

#### Step 2.1: Update i18n files

**File:** [i18n/locales/en.ts](i18n/locales/en.ts)

Add the `share` section to `chatbot` (around line 830):

```typescript
chatbot: {
  // ... existing properties
  share: {
    title: 'Share Chat',
    createLink: 'Create Share Link',
    copyLink: 'Copy Link',
    linkCopied: 'Link copied to clipboard',
    expires: 'Link expires',
    never: 'Never',
    days: 'days',
    customSlug: 'Custom slug (optional)',
    create: 'Create Share',
    existingLinks: 'Existing Share Links',
    revoke: 'Revoke',
    revokeConfirm: 'Are you sure you want to revoke this share link?',
    toasts: {
      created: 'Share link created!',
      revoked: 'Share link revoked',
      error: 'Failed to create share link',
    },
    publicPage: {
      title: 'Shared Chat',
      viewCount: '{count} views',
      sharedOn: 'Shared on {date}',
      expired: 'This share link has expired',
      notFound: 'Shared chat not found',
      tryYourself: 'Try this chat yourself',
      report: 'Report this chat',
    },
  },
  actions: {
    labels: {
      share: 'Share',
      // ... existing labels (copy, dislike, export, like)
    },
    toasts: {
      // ... existing toasts
    },
  },
  // ... rest of chatbot
}
```

**Repeat for:** `i18n/locales/es.ts`, `i18n/locales/fr.ts`, `i18n/locales/pt.ts`

#### Step 2.2: Create share composable

**File:** `composables/useShareActions.ts`

```typescript
import { toast } from 'vue-sonner'

export const useShareActions = () => {
  const { t } = useI18n()

  /**
   * Creates a share link for a chat
   * @param chatId - The ID of the chat to share
   * @param expiresAt - Optional expiration date (ISO string)
   * @returns The share response with slug and URL, or null on failure
   */
  const createShareLink = async (chatId: string, expiresAt?: string) => {
    try {
      const response = await $fetch<{
        slug: string
        shareUrl: string
        expiresAt: string | null
      }>('/api/chat/share', {
        method: 'POST',
        body: { chatId, expiresAt },
      })

      toast.success(t('chatbot.share.toasts.created'))
      return response
    } catch (error) {
      console.error('Failed to create share link:', error)
      toast.error(t('chatbot.share.toasts.error'))
      return null
    }
  }

  /**
   * Copies text to clipboard
   * @param text - The text to copy
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(t('chatbot.share.linkCopied'))
      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      toast.error('Failed to copy to clipboard')
      return false
    }
  }

  return {
    copyToClipboard,
    createShareLink,
  }
}
```

#### Step 2.3: Create share dialog component

**File:** `components/TclShareDialog.vue`

```vue
<script setup lang="ts">
import { ShareIcon, CopyIcon, CheckIcon } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const props = defineProps<{
  chatId: string
  chatTitle: string
}>()

const emit = defineEmits<{
  (e: 'created', shareUrl: string): void
}>()

const { t } = useI18n()
const { createShareLink, copyToClipboard } = useShareActions()

const open = defineModel<boolean>('open', { default: false })
const loading = ref(false)
const shareUrl = ref('')
const expirationDays = ref<number | null>(30)
const copied = ref(false)

const expirationOptions = computed(() => [
  { label: t('chatbot.share.never'), value: null as number | null },
  { label: `7 ${t('chatbot.share.days')}`, value: 7 },
  { label: `30 ${t('chatbot.share.days')}`, value: 30 },
  { label: `90 ${t('chatbot.share.days')}`, value: 90 },
])

const handleCreate = async () => {
  loading.value = true
  copied.value = false

  const expiresAt = expirationDays.value
    ? new Date(
        Date.now() + expirationDays.value * 24 * 60 * 60 * 1000,
      ).toISOString()
    : undefined

  const result = await createShareLink(props.chatId, expiresAt)
  loading.value = false

  if (result) {
    shareUrl.value = `${window.location.origin}${result.shareUrl}`
    emit('created', shareUrl.value)
  }
}

const handleCopy = async () => {
  const success = await copyToClipboard(shareUrl.value)
  if (success) {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

const reset = () => {
  shareUrl.value = ''
  expirationDays.value = 30
  copied.value = false
}

watch(open, (isOpen) => {
  if (!isOpen) {
    // Reset when dialog closes
    setTimeout(reset, 200)
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button variant="ghost" size="sm">
        <ShareIcon :size="16" class="mr-2" />
        {{ t('chatbot.actions.labels.share') }}
      </Button>
    </DialogTrigger>
    <DialogContent @escape-key-down="open = false">
      <DialogHeader>
        <DialogTitle>{{ t('chatbot.share.title') }}</DialogTitle>
        <DialogDescription class="truncate">
          {{ props.chatTitle }}
        </DialogDescription>
      </DialogHeader>

      <!-- Expiration selection -->
      <div v-if="!shareUrl" class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="expiration">{{ t('chatbot.share.expires') }}</Label>
          <div class="grid grid-cols-2 gap-2">
            <Button
              v-for="opt in expirationOptions"
              :key="opt.label"
              :variant="expirationDays === opt.value ? 'default' : 'outline'"
              type="button"
              @click="expirationDays = opt.value"
            >
              {{ opt.label }}
            </Button>
          </div>
        </div>
      </div>

      <!-- Share URL display -->
      <div v-else class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="share-url">{{ t('chatbot.share.copyLink') }}</Label>
          <div class="flex gap-2">
            <div class="relative flex-1">
              <Input
                :value="shareUrl"
                readonly
                class="pr-10 font-mono text-sm"
              />
              <a
                :href="shareUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <ShareIcon :size="14" />
              </a>
            </div>
            <Button
              variant="outline"
              size="icon"
              @click="handleCopy"
              :disabled="copied"
            >
              <CheckIcon v-if="copied" :size="16" class="text-green-600" />
              <CopyIcon v-else :size="16" />
            </Button>
          </div>
        </div>

        <p class="text-sm text-muted-foreground">
          {{
            expirationDays
              ? `Link expires in ${expirationDays} days`
              : 'Link never expires'
          }}
        </p>
      </div>

      <DialogFooter>
        <Button
          v-if="!shareUrl"
          @click="handleCreate"
          :disabled="loading"
          class="w-full"
        >
          {{ loading ? 'Creating...' : t('chatbot.share.create') }}
        </Button>
        <template v-else>
          <Button variant="outline" @click="reset">
            {{ t('chatbot.share.createLink') }}
          </Button>
          <Button @click="open = false">Done</Button>
        </template>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
```

#### Step 2.4: Integrate share button into chat page

**File:** `pages/chat.vue`

Add the share button near the chat title or in the header area:

```vue
<script setup lang="ts">
// ... existing imports
import TclShareDialog from '@/components/TclShareDialog.vue'

// ... existing code

// Add this where you have the chat title display
const shareDialogOpen = ref(false)
</script>

<template>
  <LayoutChatbot>
    <!-- Header section -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">{{ currentChat?.title }}</h1>
        <!-- ... existing header content -->
      </div>
      <TclShareDialog
        v-if="currentChat"
        :chat-id="currentChat.id"
        :chat-title="currentChat.title"
        v-model:open="shareDialogOpen"
      />
    </div>
    <!-- ... rest of template -->
  </LayoutChatbot>
</template>
```

---

### Phase 3: Public View

#### Step 3.1: Create shared chat page

**File:** `pages/shared/[slug].vue`

```vue
<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string
const { t } = useI18n()

// Fetch shared chat data
const { data, pending, error } = await useFetch(
  `/api/chat/share/${slug}`,
  {
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
  },
)

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
    { name: 'description', content: `View this shared COVID-19 chat conversation` },
  ],
})
</script>

<template>
  <LayoutPublic>
    <div class="container max-w-3xl mx-auto py-8 px-4">
      <!-- Loading state -->
      <div v-if="pending" class="flex justify-center items-center min-h-[300px]">
        <div class="animate-pulse text-muted-foreground">Loading...</div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-16">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
          <svg class="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 class="text-xl font-semibold text-destructive mb-2">
          {{ t('chatbot.share.publicPage.notFound') }}
        </h1>
        <p class="text-muted-foreground mb-6">
          This share link may have expired or been removed.
        </p>
        <Button as-child variant="default">
          <NuxtLink to="/chat">{{ t('chatbot.share.publicPage.tryYourself') }}</NuxtLink>
        </Button>
      </div>

      <!-- Shared chat content -->
      <div v-else-if="data" class="space-y-6">
        <!-- Header with metadata -->
        <div class="border-b pb-6">
          <h1 class="text-2xl font-bold mb-4">{{ data.chat.title }}</h1>
          <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>
              {{ t('chatbot.share.publicPage.sharedOn', {
                date: new Date(data.shareInfo.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              }) }}
            </span>
            <span>•</span>
            <span>
              {{ t('chatbot.share.publicPage.viewCount', {
                count: data.shareInfo.viewCount
              }) }}
            </span>
          </div>

          <div class="flex gap-3 mt-6">
            <Button as-child size="default">
              <NuxtLink to="/chat">{{ t('chatbot.share.publicPage.tryYourself') }}</NuxtLink>
            </Button>
            <Button
              variant="outline"
              size="default"
              @click="navigator.clipboard.writeText(window.location.href)"
            >
              <ShareIcon :size="16" class="mr-2" />
              {{ t('chatbot.share.copyLink') }}
            </Button>
          </div>
        </div>

        <!-- Conversation display -->
        <TclConversation
          :messages="data.messages"
          :readonly="true"
        />
      </div>
    </div>
  </LayoutPublic>
</template>
```

#### Step 3.2: Update TclConversation for readonly mode (if needed)

**File:** `components/TclConversation.vue`

If the component doesn't already support a readonly mode, add a prop:

```vue
<script setup lang="ts">
// Add to props
const props = defineProps<{
  messages: (UIMessage & { liked?: boolean | null })[]
  readonly?: boolean  // Add this
}>()
</script>

<template>
  <div class="space-y-6">
    <!-- Hide input/prompt when readonly -->
    <div
      v-for="message in messages"
      :key="message.id"
      :class="[
        'flex gap-4',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      ]"
    >
      <!-- ... existing message display ... -->
    </div>
  </div>
</template>
```

#### Step 3.3: Verify public route is not protected

**File:** `assets/constants/protected-pages.ts`

Ensure `/shared/[slug]` is NOT in the `PROTECTED_PAGES` array (it should be publicly accessible).

---

### Phase 4: Management

#### Step 4.1: List user's shared links

**File:** `server/api/chat/share/list.get.ts`

```typescript
import { consola } from 'consola'
import { db } from '@/lib/db'
import { sharedChats, users, chats } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import * as Sentry from '@sentry/nuxt'

export default defineEventHandler(async (event) => {
  // Validate user authentication
  const { user: sessionUser } = await getUserSession(event)

  if (!sessionUser) {
    throw createError({
      status: 401,
      message: 'Unauthorized',
      statusMessage: 'You must be logged in to view your shared links',
    })
  }

  try {
    // Get the user ID from the database
    const [dbUser] = await Sentry.startSpan(
      {
        name: 'get user by email',
        op: 'database.query',
      },
      async () => {
        return await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, sessionUser.email))
          .limit(1)
      },
    )

    if (!dbUser) {
      throw createError({
        status: 404,
        message: 'Not found',
        statusMessage: 'User not found in database',
      })
    }

    // Fetch all shared chats created by this user
    const sharedChatsList = await Sentry.startSpan(
      {
        name: 'get user shared chats',
        op: 'database.query',
      },
      async () => {
        return await db
          .select({
            id: sharedChats.id,
            slug: sharedChats.slug,
            createdAt: sharedChats.createdAt,
            expiresAt: sharedChats.expiresAt,
            viewCount: sharedChats.viewCount,
            chatId: sharedChats.chatId,
            chatTitle: chats.title,
          })
          .from(sharedChats)
          .innerJoin(chats, eq(sharedChats.chatId, chats.id))
          .where(eq(sharedChats.createdBy, dbUser.id))
          .orderBy(desc(sharedChats.createdAt))
      },
    )

    consola.success(
      `Retrieved ${sharedChatsList.length} shared links for user`,
    )

    return { sharedChats: sharedChatsList }
  } catch (error) {
    consola.error('Error retrieving shared links:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    Sentry.captureException(error)

    throw createError({
      status: 500,
      message: 'Internal server error',
      statusMessage: 'Failed to retrieve shared links',
    })
  }
})
```

#### Step 4.2: Revoke share link

**File:** `server/api/chat/share.delete.ts`

```typescript
import { consola } from 'consola'
import { db } from '@/lib/db'
import { sharedChats, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import * as Sentry from '@sentry/nuxt'

export default defineEventHandler(async (event) => {
  // Validate user authentication
  const { user: sessionUser } = await getUserSession(event)

  if (!sessionUser) {
    throw createError({
      status: 401,
      message: 'Unauthorized',
      statusMessage: 'You must be logged in to revoke share links',
    })
  }

  const query = getQuery(event)
  const slug = query.slug as string

  if (!slug) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Slug is required',
    })
  }

  try {
    // Get the user ID from the database
    const [dbUser] = await Sentry.startSpan(
      {
        name: 'get user by email',
        op: 'database.query',
      },
      async () => {
        return await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, sessionUser.email))
          .limit(1)
      },
    )

    if (!dbUser) {
      throw createError({
        status: 404,
        message: 'Not found',
        statusMessage: 'User not found in database',
      })
    }

    // Verify the share link belongs to this user
    const [sharedChat] = await Sentry.startSpan(
      {
        name: 'get shared chat by slug',
        op: 'database.query',
      },
      async () => {
        return await db
          .select({ id: sharedChats.id, createdBy: sharedChats.createdBy })
          .from(sharedChats)
          .where(eq(sharedChats.slug, slug))
          .limit(1)
      },
    )

    if (!sharedChat) {
      throw createError({
        status: 404,
        message: 'Not found',
        statusMessage: 'Share link not found',
      })
    }

    if (sharedChat.createdBy !== dbUser.id) {
      throw createError({
        status: 403,
        message: 'Forbidden',
        statusMessage: 'You do not have permission to revoke this share link',
      })
    }

    // Delete the share link
    await Sentry.startSpan(
      {
        name: 'delete shared chat',
        op: 'database.query',
      },
      async () => {
        await db
          .delete(sharedChats)
          .where(eq(sharedChats.slug, slug))
      },
    )

    consola.success(`Revoked share link: ${slug}`)

    return { success: true }
  } catch (error) {
    consola.error('Error revoking share link:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    Sentry.captureException(error)

    throw createError({
      status: 500,
      message: 'Internal server error',
      statusMessage: 'Failed to revoke share link',
    })
  }
})
```

#### Step 4.3: (Optional) Add share management UI

Create a settings page or section where users can view and manage their shared links.

**File:** `pages/account/shares.vue` (optional)

```vue
<script setup lang="ts">
const { t } = useI18n()

const { data, pending, refresh } = await useFetch('/api/chat/share/list')

const handleRevoke = async (slug: string) => {
  if (!confirm(t('chatbot.share.revokeConfirm'))) return

  try {
    await $fetch('/api/chat/share', {
      method: 'DELETE',
      params: { slug },
    })
    toast.success(t('chatbot.share.toasts.revoked'))
    refresh()
  } catch (error) {
    toast.error('Failed to revoke share link')
  }
}
</script>

<template>
  <LayoutAccount>
    <div class="max-w-4xl mx-auto py-8">
      <h1 class="text-2xl font-bold mb-6">{{ t('chatbot.share.existingLinks') }}</h1>

      <div v-if="pending">Loading...</div>

      <div v-else-if="data?.sharedChats.length === 0" class="text-center py-12 text-muted-foreground">
        No shared links yet
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="share in data?.sharedChats"
          :key="share.id"
          class="border rounded-lg p-4 flex items-center justify-between"
        >
          <div>
            <h3 class="font-medium">{{ share.chatTitle }}</h3>
            <p class="text-sm text-muted-foreground">
              {{ share.viewCount }} views • Created {{ new Date(share.createdAt).toLocaleDateString() }}
            </p>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" as-child>
              <NuxtLink :to="`/shared/${share.slug}`" target="_blank">
                View
              </NuxtLink>
            </Button>
            <Button variant="ghost" size="sm" @click="handleRevoke(share.slug)">
              {{ t('chatbot.share.revoke') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </LayoutAccount>
</template>
```

---

### Phase 5: Polish & Testing

#### Security & Rate Limiting

**Add rate limiting to share creation:**

```typescript
// In server/api/chat/share.create.post.ts
import { ratelimit } from '@/lib/utils/ratelimit'

// After auth check, add:
const { success } = await ratelimit.limit({
  key: `share:create:${dbUser.id}`,
  limit: 10, // max 10 shares per hour
  duration: 3600, // 1 hour
})

if (!success) {
  throw createError({
    status: 429,
    message: 'Too many requests',
    statusMessage: 'Please wait before creating more share links',
  })
}
```

#### Content Moderation (Optional)

Integrate with existing Guard Tool:

```typescript
// In server/api/chat/share.create.post.ts
import { moderateContent } from '@/lib/chat/guard'

// After ownership check, add:
const [lastMessage] = await db
  .select({ content: messages.content })
  .from(messages)
  .where(eq(messages.chatId, chatId))
  .orderBy(desc(messages.createdAt))
  .limit(1)

if (lastMessage) {
  const moderation = await moderateContent(lastMessage.content)
  if (moderation.flagged) {
    throw createError({
      status: 400,
      message: 'Content policy violation',
      statusMessage: 'This chat cannot be shared due to content policy',
    })
  }
}
```

#### Testing Checklist

- [ ] User can create share link for their chat
- [ ] Share link works for anonymous users (no auth required)
- [ ] Share link displays correctly on mobile devices
- [ ] Expired links show appropriate message
- [ ] View count increments correctly
- [ ] User can revoke their share links
- [ ] Non-owner cannot create share link for chat (403 error)
- [ ] Invalid slug returns 404
- [ ] Copy to clipboard works
- [ ] i18n works for all languages (en, es, fr, pt)
- [ ] Sentry captures errors appropriately
- [ ] Rate limiting prevents abuse
- [ ] Original chat deletion cascades to shared chats (404 on access)

#### Analytics Events (Statsig)

Add tracking events:

```typescript
// In TclShareDialog.vue, after successful creation:
if (result) {
  statsig.track('share_link_created', {
    chat_id: props.chatId,
    expiration_days: expirationDays.value,
  })
}

// In server/api/chat/share/[slug].get.ts, after incrementing view count:
statsig.track('shared_chat_viewed', {
  slug,
  view_count: sharedChat.viewCount + 1,
})
```

---

## File Structure Summary

```
lib/db/schema/index.ts           // UPDATE: Add sharedChats table
server/api/chat/
  ├── share.create.post.ts       // NEW: Create share link
  ├── share.delete.ts            // NEW: Revoke share link
  ├── share.list.get.ts          // NEW: List user's shares
  └── share/
      └── [slug].get.ts          // NEW: Public access to shared chat
components/
  ├── TclShareDialog.vue         // NEW: Share creation dialog
  └── TclConversation.vue        // UPDATE: Add readonly prop support
pages/
  ├── shared/
  │   └── [slug].vue             // NEW: Public shared chat page
  └── account/
      └── shares.vue             // NEW: (Optional) Share management page
composables/
  └── useShareActions.ts         // NEW: Share action handlers
i18n/locales/
  ├── en.ts                      // UPDATE: Add share strings
  ├── es.ts                      // UPDATE: Add share strings
  ├── fr.ts                      // UPDATE: Add share strings
  └── pt.ts                      // UPDATE: Add share strings
```

---

## Edge Cases & Handling

| Scenario | Handling |
|----------|----------|
| Original chat deleted | Share link returns 404 (cascade delete) |
| Share link expires | Show expiration message with CTA to main chatbot |
| User account deleted | Share links remain active (anonymous view) |
| Slug collision | nanoid(12) collision probability is negligible |
| Malicious content | Integrate with Guard Tool, add report button |
| Bot enumeration | Rate limiting + 12-char random slugs (~72 bits entropy) |
| Shared chat has no messages | Show empty state message |
| Concurrent view count updates | Database handles atomic increments |

---

## Implementation Sequence Recommendation

1. **Start with Phase 1** (Database & Core API) - Foundation
2. **Then Phase 2** (UI Integration) - Add share button to chat
3. **Then Phase 3** (Public View) - Enable shared chat viewing
4. **Then Phase 4** (Management) - Add share management (optional)
5. **Finally Phase 5** (Polish) - Security, testing, analytics

---

## References

- Database schema: [lib/db/schema/index.ts](lib/db/schema/index.ts)
- Chat retrieve endpoint: [server/api/chat/retrieve.get.ts](server/api/chat/retrieve.get.ts)
- Chat actions: [components/TclChatActions.vue](components/TclChatActions.vue)
- Action handlers: [composables/useChatActions.ts](composables/useChatActions.ts)
- i18n structure: [i18n/locales/en.ts](i18n/locales/en.ts)
- Protected pages: [assets/constants/protected-pages.ts](assets/constants/protected-pages.ts)
- Auth middleware: [middleware/redirect.global.ts](middleware/redirect.global.ts)
- Guard tool: [lib/chat/guard.ts](lib/chat/guard.ts)
