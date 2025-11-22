import { consola } from 'consola'
import { db } from '@/lib/db'
import { chats, users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import * as Sentry from '@sentry/nuxt'

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

    // Query database to fetch chats for the authenticated user
    const userChats = await Sentry.startSpan(
      {
        name: 'get user chats',
        op: 'database.query',
      },
      async () => {
        return await db
          .select({
            id: chats.id,
            title: chats.title,
            createdAt: chats.createdAt,
            userId: chats.userId,
          })
          .from(chats)
          .where(eq(chats.userId, dbUser.id))
          .orderBy(desc(chats.createdAt))
      },
    )

    consola.success(
      `Successfully retrieved ${userChats.length} chats for user ${sessionUser.email}`,
    )

    // Return JSON array of chat objects
    return {
      success: true,
      data: userChats,
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
