import { consola } from 'consola'
import { db } from '@/lib/db'
import { likes, users, messages } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import * as Sentry from '@sentry/nuxt'

export default defineEventHandler(async (event) => {
  // Validate user authentication
  const { user: sessionUser } = await getUserSession(event)

  if (!sessionUser) {
    throw createError({
      status: 401,
      message: 'Unauthorized',
      statusMessage: 'You must be logged in to access your likes',
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

    // Query database to fetch all likes/dislikes for the authenticated user
    const userLikes = await Sentry.startSpan(
      {
        name: 'get user likes',
        op: 'database.query',
      },
      async () => {
        return await db
          .select({
            id: likes.id,
            messageId: likes.messageId,
            like: likes.like,
            createdAt: likes.createdAt,
            message: {
              id: messages.id,
              messageId: messages.messageId,
              content: messages.content,
              role: messages.role,
              chatId: messages.chatId,
            },
          })
          .from(likes)
          .leftJoin(messages, eq(likes.messageId, messages.id))
          .where(eq(likes.userId, dbUser.id))
          .orderBy(desc(likes.createdAt))
      },
    )

    return {
      success: true,
      likes: userLikes,
      total: userLikes.length,
    }
  } catch (e) {
    consola.error('Error fetching user likes:', e)
    Sentry.captureException(e)

    // If it's already a createError, rethrow it
    if (e && typeof e === 'object' && 'statusCode' in e) {
      throw e
    }

    // Otherwise, throw a generic database error
    throw createError({
      status: 500,
      message: 'Internal server error',
      statusMessage: 'Failed to fetch user likes',
    })
  }
})
