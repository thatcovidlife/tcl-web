import { consola } from 'consola'
import { db } from '@/lib/db'
import { chats, users, messages } from '@/lib/db/schema'
import { eq, desc, count, and, asc } from 'drizzle-orm'
import * as Sentry from '@sentry/nuxt'
import { sanitizeMarkdown } from '@/assets/utils/sanitize-markdown'

export default defineEventHandler(async (event) => {
  // Validate user authentication
  const { user: sessionUser } = await getUserSession(event)

  if (!sessionUser) {
    throw createError({
      status: 401,
      message: 'Unauthorized',
      statusMessage: 'You must be logged in to access chat history',
    })
  }

  // Parse pagination query parameters
  const query = getQuery(event)
  const limit = Math.min(
    Math.max(parseInt(query.limit as string) || 10, 1),
    100,
  )
  const offset = Math.max(parseInt(query.offset as string) || 0, 0)

  try {
    // First, get the user ID from the database using the email
    const [dbUser] = await Sentry.startSpan(
      {
        name: 'get user by email',
        op: 'database.query',
      },
      async () => {
        return await db
          .select({
            id: users.id,
          })
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

    // Get total count of chats for pagination metadata
    const [totalCount] = await Sentry.startSpan(
      {
        name: 'count user chats',
        op: 'database.query',
      },
      async () => {
        return await db
          .select({ count: count() })
          .from(chats)
          .where(eq(chats.userId, dbUser.id))
      },
    )

    // Query database to fetch chats for the authenticated user with pagination
    // Also get the first assistant message for each chat
    const userChats = await Sentry.startSpan(
      {
        name: 'get user chats',
        op: 'database.query',
      },
      async () => {
        // First, get the chats with pagination
        const chatList = await db
          .select({
            id: chats.id,
            title: chats.title,
            createdAt: chats.createdAt,
            userId: chats.userId,
          })
          .from(chats)
          .where(eq(chats.userId, dbUser.id))
          .orderBy(desc(chats.createdAt))
          .limit(limit)
          .offset(offset)

        // For each chat, get the first assistant message
        const chatsWithPreview = await Promise.all(
          chatList.map(async (chat) => {
            const [firstAssistantMessage] = await db
              .select({
                content: messages.content,
              })
              .from(messages)
              .where(
                and(
                  eq(messages.chatId, chat.id),
                  eq(messages.role, 'assistant'),
                ),
              )
              .orderBy(asc(messages.createdAt))
              .limit(1)

            // Extract first 300 characters and sanitize
            let preview = ''
            if (firstAssistantMessage?.content) {
              const rawContent = firstAssistantMessage.content.substring(0, 300)
              preview = sanitizeMarkdown(rawContent)
              if (preview.length > 300) {
                preview = preview.substring(0, 300) + '...'
              }
            }

            return {
              ...chat,
              preview,
            }
          }),
        )

        return chatsWithPreview
      },
    )

    const total = totalCount?.count || 0
    const hasMore = offset + limit < total

    consola.success(
      `Successfully retrieved ${userChats.length} of ${total} chats for user ${sessionUser.email} (limit: ${limit}, offset: ${offset})`,
    )

    // Return JSON array of chat objects with pagination metadata
    return {
      success: true,
      data: userChats,
      pagination: {
        limit,
        offset,
        total,
        hasMore,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    // Log error and capture in Sentry
    consola.error('Failed to retrieve user chats:', error)
    Sentry.captureException(error)

    throw createError({
      status: 500,
      message: 'Internal server error',
      statusMessage: 'Failed to retrieve chat history',
    })
  }
})
