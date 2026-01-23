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
    const [createdSharedChat] = await Sentry.startSpan(
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
      slug: createdSharedChat.slug,
      shareUrl: `/shared/${createdSharedChat.slug}`,
      expiresAt: createdSharedChat.expiresAt,
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
