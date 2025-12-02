import { consola } from 'consola'
import { db } from '@/lib/db'
import { likes, users, messages } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import * as Sentry from '@sentry/nuxt'

export default defineEventHandler(async (event) => {
  const { user: sessionUser } = await getUserSession(event)
  const body = await readBody(event)
  const { messageId } = body

  // Validate input
  if (!messageId || typeof messageId !== 'string') {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'messageId is required and must be a string',
    })
  }

  // Check if user is authenticated
  if (!sessionUser) {
    throw createError({
      status: 401,
      message: 'Unauthorized',
      statusMessage: 'You must be logged in to delete likes',
    })
  }

  try {
    // Get the current user from the database
    const [currentUser] = await Sentry.startSpan(
      {
        name: 'get user by email',
        op: 'database.query',
      },
      async () => {
        return await db
          .select()
          .from(users)
          .where(eq(users.email, sessionUser.email))
          .limit(1)
      },
    )

    if (!currentUser) {
      throw createError({
        status: 404,
        message: 'Not found',
        statusMessage: 'User not found',
      })
    }

    const userId = currentUser.id

    // First, get the message by messageId (varchar field, not UUID)
    const [message] = await Sentry.startSpan(
      {
        name: 'get message by messageId',
        op: 'database.query',
      },
      async () => {
        return await db
          .select()
          .from(messages)
          .where(eq(messages.messageId, messageId))
          .limit(1)
      },
    )

    if (!message) {
      throw createError({
        status: 404,
        message: 'Not found',
        statusMessage: 'Message not found',
      })
    }

    // Check if the like exists (using the database UUID)
    const [existingLike] = await Sentry.startSpan(
      {
        name: 'get existing like',
        op: 'database.query',
      },
      async () => {
        return await db
          .select()
          .from(likes)
          .where(and(eq(likes.messageId, message.id), eq(likes.userId, userId)))
          .limit(1)
      },
    )

    if (!existingLike) {
      throw createError({
        status: 404,
        message: 'Not found',
        statusMessage: 'Like not found for this message',
      })
    }

    // Delete the like
    await Sentry.startSpan(
      {
        name: 'delete like',
        op: 'database.query',
      },
      async () => {
        return await db.delete(likes).where(eq(likes.id, existingLike.id))
      },
    )

    return {
      success: true,
      messageId,
      message: 'Like removed successfully',
    }
  } catch (e) {
    consola.error('Error deleting like:', e)
    Sentry.captureException(e)

    // If it's already a createError, rethrow it
    if (e && typeof e === 'object' && 'statusCode' in e) {
      throw e
    }

    // Otherwise, throw a generic database error
    throw createError({
      status: 500,
      message: 'Internal server error',
      statusMessage: 'Failed to delete like',
    })
  }
})
