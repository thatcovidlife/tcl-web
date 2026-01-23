import { consola } from 'consola'
import { db } from '@/lib/db'
import { sharedChats, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
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

  const slug = getRouterParam(event, 'slug')

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
        await db.delete(sharedChats).where(eq(sharedChats.slug, slug))
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
