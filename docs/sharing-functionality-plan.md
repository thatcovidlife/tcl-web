# Chat Sharing Functionality - Implementation Plan

## Overview

This document outlines the plan to add sharing functionality to the chatbot, allowing users to create shareable links for their conversations and enabling public access to shared chats.

## Current Architecture Analysis

### Database Schema (`lib/db/schema/index.ts`)

Current tables:

- `users` - User accounts (id, email, role, active)
- `profiles` - User profiles (id, name, bio, website, userId, language, theme)
- `chats` - Chat sessions (id, createdAt, userId, title)
- `messages` - Chat messages (id, createdAt, chatId, messageId, content, role, parts)
- `likes` - Message feedback (id, createdAt, messageId, userId, like)

### API Endpoints (`server/api/chat/`)

- `create.post.ts` - Creates new chat session
- `retrieve.get.ts` - Retrieves chat with messages (requires auth, verifies ownership)
- `list.get.ts` - Lists user's chat history with pagination
- `save.post.ts` - Saves messages to a chat
- `like.post.ts` / `like.delete.ts` - Handles message feedback
- `search.post.ts` - Searches chat history
- `index.post.ts` - Main chat streaming endpoint

### UI Components

- `pages/chat.vue` - Main chat page with conversation management
- `components/TclConversation.vue` - Displays conversation messages
- `components/TclChatActions.vue` - Message actions (like, dislike, copy, export)
- `components/TclChatSidebar.vue` - Chat history sidebar
- `composables/useChatActions.ts` - Action handlers

### Auth Pattern

- Uses `getUserSession(event)` to authenticate users
- Verifies chat ownership: `chat.userId === dbUser.id`
- Protected routes enforced via `middleware/redirect.global.ts`

---

## Implementation Plan

### 1. Database Schema Updates

#### New Table: `shared_chats`

Create a new table to manage shared conversations:

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
    expiresAt: timestamp('expires_at'), // Optional: null = never expires
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

**Fields:**

- `id` - Unique identifier for the share record
- `createdAt` - When the share link was created
- `chatId` - Reference to the original chat
- `slug` - URL-friendly unique identifier for public access
- `expiresAt` - Optional expiration date (null = permanent)
- `viewCount` - Track how many times the shared chat was viewed
- `createdBy` - User who created the share link

**Migration required:** `yarn db:generate` → `yarn db:migrate`

---

### 2. API Endpoints

#### 2.1 Create Share Link

**File:** `server/api/chat/share.create.post.ts`

```typescript
// Creates a new share link for a chat
// POST /api/chat/share
// Body: { chatId: string, expiresAt?: string }
// Returns: { slug: string, shareUrl: string }
```

Features:

- Verify user owns the chat
- Generate unique slug (nanoid or custom)
- Optional expiration date
- Rate limiting to prevent abuse

#### 2.2 Get Shared Chat (Public)

**File:** `server/api/chat/share/[slug].get.ts`

```typescript
// Retrieves a shared chat by slug (no auth required)
// GET /api/chat/share/:slug
// Returns: { chat, messages, shareInfo }
```

Features:

- No authentication required (public access)
- Increment viewCount
- Return chat with all messages
- Include share metadata (created date, view count)
- Return 404 if slug not found or expired

#### 2.3 List User's Shared Links

**File:** `server/api/chat/share/list.get.ts`

```typescript
// Lists all share links created by the user
// GET /api/chat/share/list
// Returns: { sharedChats: [...] }
```

#### 2.4 Revoke Share Link

**File:** `server/api/chat/share.delete.ts`

```typescript
// Deletes a share link
// DELETE /api/chat/share?slug=xxx
// Returns: { success: true }
```

#### 2.5 Update Share Link

**File:** `server/api/chat/share.patch.ts`

```typescript
// Update share link expiration or settings
// PATCH /api/chat/share
// Body: { slug: string, expiresAt?: string }
```

---

### 3. UI Components

#### 3.1 Share Button in Chat Actions

**Update:** `components/TclChatActions.vue`

Add a new "Share" action button to the existing actions list:

```vue
{ label: t('chatbot.actions.labels.share'), icon: ShareIcon, handler: () => {
emit('share', props.chatId) }, tooltip: t('chatbot.actions.labels.share'), }
```

**Note:** The share action should be at the chat/conversation level, not per-message.

#### 3.2 Share Dialog Component

**New file:** `components/TclShareDialog.vue`

Features:

- Input field for custom slug (optional, auto-generated by default)
- Expiration date picker
- Preview of share URL
- Copy to clipboard button
- List of existing share links for this chat

#### 3.3 Shared Chat Page

**New file:** `pages/shared/[slug].vue`

A read-only public view of a shared conversation:

```vue
<template>
  <LayoutPublic>
    <TclSharedConversation :slug="slug" />
  </LayoutPublic>
</template>
```

**Features:**

- Read-only display (no input)
- Show share metadata (views, created date)
- "Try this chat yourself" CTA → redirects to main chatbot
- Share this chat button
- Report/flag option (for moderation)

#### 3.4 Update Chat Sidebar

**Update:** `components/TclChatSidebar.vue`

Add indicator icon next to chats that have been shared.

---

### 4. Internationalization (i18n)

**Update:** `i18n/locales/en.ts`

Add new strings:

```typescript
chatbot: {
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
    },
  },
}
```

**Repeat for:** `es.ts`, `fr.ts`, `pt.ts`

---

### 5. Security Considerations

#### 5.1 Rate Limiting

- Apply existing Upstash Redis rate limiting to share creation
- Limit per-user share links (e.g., max 10 per chat, 100 per user)

#### 5.2 Content Moderation

- Integrate with existing Guard Tool (`lib/chat/guard.ts`)
- Flag shared chats for review if detected policy violations
- Option to auto-hide flagged shares

#### 5.3 Slug Generation

- Use cryptographically random slugs (nanoid v4, 12+ characters)
- Avoid dictionary words, prevent enumeration
- Check for uniqueness before insertion

#### 5.4 Expiration Defaults

- Default: 30 days
- Maximum: 1 year
- Admins can create permanent shares

#### 5.5 Privacy

- Never expose user emails in public share pages
- Only show chat title and messages
- Add robots meta tag to prevent indexing (optional)

---

### 6. Implementation Steps

#### Phase 1: Database & Core API

1. Add `sharedChats` table to schema
2. Generate and run migration
3. Create `share.create.post.ts` endpoint
4. Create `share/[slug].get.ts` endpoint
5. Add tests for new endpoints

#### Phase 2: UI Integration

6. Update `TclChatActions` with share button
7. Create `TclShareDialog` component
8. Add share action handler to `useChatActions`
9. Update i18n files with share strings

#### Phase 3: Public View

10. Create `pages/shared/[slug].vue`
11. Create `TclSharedConversation` component
12. Add "Try this chat" CTA
13. Add share metadata display

#### Phase 4: Management

14. Create `share/list.get.ts` endpoint
15. Create `share.delete.ts` endpoint
16. Add share management to user settings
17. Update sidebar with share indicators

#### Phase 5: Polish

18. Add Sentry error tracking
19. Add analytics events (Statsig)
20. Performance optimization
21. Cross-browser testing
22. Accessibility review

---

### 7. File Structure

```
lib/db/schema/index.ts           // Add sharedChats table
server/api/chat/
  ├── share.create.post.ts       // NEW: Create share link
  ├── share.delete.ts            // NEW: Revoke share link
  ├── share.list.get.ts          // NEW: List user's shares
  ├── share.patch.ts             // NEW: Update share link
  └── share/
      └── [slug].get.ts          // NEW: Public access to shared chat
components/
  ├── TclShareDialog.vue         // NEW: Share creation dialog
  ├── TclSharedConversation.vue  // NEW: Public chat display
  └── TclChatActions.vue         // UPDATE: Add share button
pages/
  └── shared/
      └── [slug].vue             // NEW: Public shared chat page
composables/
  └── useShareActions.ts         // NEW: Share action handlers
i18n/locales/
  ├── en.ts                      // UPDATE: Add share strings
  ├── es.ts                      // UPDATE: Add share strings
  ├── fr.ts                      // UPDATE: Add share strings
  └── pt.ts                      // UPDATE: Add share strings
```

---

### 8. Edge Cases & Considerations

| Scenario                          | Handling                                            |
| --------------------------------- | --------------------------------------------------- |
| Original chat deleted             | Share link returns 404 (cascade delete)             |
| Share link expires                | Show expiration message, option to request new link |
| User account deleted              | Share links remain active (anonymous view)          |
| Slug collision                    | Regenerate with new random value                    |
| Malicious content in shared chat  | Integrate with Guard Tool, add report button        |
| Bot attempting to enumerate slugs | Rate limiting + long random slugs                   |
| Shared chat has no messages       | Show empty state message                            |
| User wants to update shared chat  | New share link required (immutable by design)       |

---

### 9. Testing Checklist

- [ ] User can create share link for their chat
- [ ] Share link works for anonymous users
- [ ] Share link displays correctly on mobile
- [ ] Expired links show appropriate message
- [ ] View count increments correctly
- [ ] User can revoke their share links
- [ ] Non-owner cannot create share link for chat
- [ ] Invalid slug returns 404
- [ ] Copy to clipboard works
- [ ] i18n works for all languages
- [ ] Sentry captures errors appropriately

---

### 10. Future Enhancements

- QR code generation for share links
- Social media preview cards (Open Graph)
- Export shared chat as PDF
- Embed shared chat on external sites
- Password-protected share links
- Analytics dashboard for share performance
- Allow users to "fork" shared chats

---

## References

- Current chat schema: `lib/db/schema/index.ts:57-79`
- Chat retrieve endpoint: `server/api/chat/retrieve.get.ts`
- Chat actions: `components/TclChatActions.vue`
- Main chat page: `pages/chat.vue`
- i18n structure: `i18n/locales/en.ts:830-893`
- Auth pattern: `server/api/chat/retrieve.get.ts:8-17`
