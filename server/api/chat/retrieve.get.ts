import { consola } from 'consola'
import { db } from '@/lib/db'
import { chats, messages, users, likes } from '@/lib/db/schema'
import { eq, asc, and, inArray } from 'drizzle-orm'
import * as Sentry from '@sentry/nuxt'

export default defineEventHandler(async (event) => {
  // Validate user authentication
  const { user: sessionUser } = await getUserSession(event)

  if (!sessionUser) {
    throw createError({
      status: 401,
      message: 'Unauthorized',
      statusMessage: 'You must be logged in to retrieve chat details',
    })
  }

  // Get chat ID from query parameters
  const query = getQuery(event)
  const chatId = query.id as string

  if (!chatId) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Chat ID is required',
    })
  }

  try {
    // Get the user ID from the database using the email
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

    // Fetch the chat by ID
    const [chat] = await Sentry.startSpan(
      {
        name: 'get chat by id',
        op: 'database.query',
      },
      async () => {
        return await db
          .select()
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

    // Verify ownership
    if (chat.userId !== dbUser.id) {
      throw createError({
        status: 403,
        message: 'Forbidden',
        statusMessage: 'You do not have permission to access this chat',
      })
    }

    // Fetch all messages for this chat, ordered by oldest first
    const chatMessages = await Sentry.startSpan(
      {
        name: 'get chat messages',
        op: 'database.query',
      },
      async () => {
        return await db
          .select()
          .from(messages)
          .where(eq(messages.chatId, chatId))
          .orderBy(asc(messages.createdAt))
      },
    )

    // Fetch user's likes for all messages in this chat
    const userLikes = await Sentry.startSpan(
      {
        name: 'get user likes for chat messages',
        op: 'database.query',
      },
      async () => {
        const messageIds = chatMessages.map((msg) => msg.id)
        if (messageIds.length === 0) return []

        return await db
          .select({
            messageId: likes.messageId,
            like: likes.like,
          })
          .from(likes)
          .where(
            and(
              eq(likes.userId, dbUser.id),
              inArray(likes.messageId, messageIds),
            ),
          )
      },
    )

    // Create a map for quick lookup of likes by message ID
    const likesMap = new Map<string, boolean>()
    userLikes.forEach((like) => {
      likesMap.set(like.messageId, like.like)
    })

    consola.success(
      `Retrieved chat ${chatId} with ${chatMessages.length} messages`,
    )

    // Return chat details with messages array including like status
    return {
      chat: {
        id: chat.id,
        title: chat.title,
        userId: chat.userId,
        createdAt: chat.createdAt,
      },
      messages: chatMessages.map((msg) => ({
        id: msg.messageId,
        role: msg.role,
        content: msg.content,
        parts: msg.parts,
        liked: likesMap.get(msg.id) ?? null,
      })),
    }
  } catch (error) {
    consola.error('Error retrieving chat:', error)

    // Re-throw if it's already a createError error
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    Sentry.captureException(error)

    throw createError({
      status: 500,
      message: 'Internal server error',
      statusMessage: 'Failed to retrieve chat',
    })
  }
})
