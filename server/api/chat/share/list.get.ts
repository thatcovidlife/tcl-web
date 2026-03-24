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

    consola.success(`Retrieved ${sharedChatsList.length} shared links for user`)

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
