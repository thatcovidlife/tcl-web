import { consola } from 'consola'
import { db } from '@/lib/db'
import { likes, messages, users } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import * as Sentry from '@sentry/nuxt'

export default defineEventHandler(async (event) => {
  const { user: sessionUser } = await getUserSession(event)
  const body = await readBody(event)
  const { messageId, like: likeAction } = body

  // Validate input
  if (!messageId || typeof messageId !== 'string') {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'messageId is required and must be a string',
    })
  }

  if (typeof likeAction !== 'boolean') {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'like is required and must be a boolean (true or false)',
    })
  }

  // Check if user is authenticated
  if (!sessionUser) {
    throw createError({
      status: 401,
      message: 'Unauthorized',
      statusMessage: 'You must be logged in to like/dislike messages',
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

    // Verify the message exists
    const [message] = await Sentry.startSpan(
      {
        name: 'get message by id',
        op: 'database.query',
      },
      async () => {
        return await db
          .select()
          .from(messages)
          .where(eq(messages.id, messageId))
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

    // Check if the user has already liked/disliked this message
    const [existingLike] = await Sentry.startSpan(
      {
        name: 'get existing like',
        op: 'database.query',
      },
      async () => {
        return await db
          .select()
          .from(likes)
          .where(and(eq(likes.messageId, messageId), eq(likes.userId, userId)))
          .limit(1)
      },
    )

    if (existingLike) {
      // Update existing like/dislike
      await Sentry.startSpan(
        {
          name: 'update like',
          op: 'database.query',
        },
        async () => {
          return await db
            .update(likes)
            .set({ like: likeAction })
            .where(eq(likes.id, existingLike.id))
        },
      )
    } else {
      // Create new like/dislike
      await Sentry.startSpan(
        {
          name: 'insert like',
          op: 'database.query',
        },
        async () => {
          return await db.insert(likes).values({
            messageId,
            userId,
            like: likeAction,
          })
        },
      )
    }

    // Get updated like/dislike counts for the message
    const counts = await Sentry.startSpan(
      {
        name: 'get like counts',
        op: 'database.query',
      },
      async () => {
        return await db
          .select({
            likes: sql<number>`COUNT(*) FILTER (WHERE ${likes.like} = true)`,
            dislikes: sql<number>`COUNT(*) FILTER (WHERE ${likes.like} = false)`,
          })
          .from(likes)
          .where(eq(likes.messageId, messageId))
      },
    )

    return {
      success: true,
      messageId,
      likes: Number(counts[0]?.likes || 0),
      dislikes: Number(counts[0]?.dislikes || 0),
    }
  } catch (e) {
    consola.error('Error updating like/dislike:', e)
    Sentry.captureException(e)

    // If it's already a createError, rethrow it
    if (e && typeof e === 'object' && 'statusCode' in e) {
      throw e
    }

    // Otherwise, throw a generic database error
    throw createError({
      status: 500,
      message: 'Internal server error',
      statusMessage: 'Failed to update like/dislike',
    })
  }
})
