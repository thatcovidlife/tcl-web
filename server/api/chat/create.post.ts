import { consola } from 'consola'
import { db } from '@/lib/db'
import { chats, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import * as Sentry from '@sentry/nuxt'
import { sanitizeChatTitle } from '@/lib/utils'

export default defineEventHandler(async (event) => {
  const { user: sessionUser } = await getUserSession(event)
  const { user_id, title } = await readBody(event)

  if (!user_id || !title) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'user_id and title are required',
    })
  }

  // Sanitize the title
  const sanitizedTitle = sanitizeChatTitle(title)

  if (!sanitizedTitle || sanitizedTitle.trim().length === 0) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Invalid chat title',
    })
  }

  if (!sessionUser) {
    throw createError({
      status: 401,
      message: 'Unauthorized',
      statusMessage: 'You must be logged in to create a chat',
    })
  }

  try {
    // Verify the user exists and matches the session
    const [existingUser] = await Sentry.startSpan(
      {
        name: 'get user by id',
        op: 'database.query',
      },
      async () => {
        return await db
          .select()
          .from(users)
          .where(eq(users.id, user_id))
          .limit(1)
      },
    )

    if (!existingUser) {
      throw createError({
        status: 404,
        message: 'Not found',
        statusMessage: 'User not found',
      })
    }

    if (existingUser.email !== sessionUser.email) {
      throw createError({
        status: 403,
        message: 'Forbidden',
        statusMessage: 'You are not authorized to create chats for this user',
      })
    }

    // Create the chat
    const [newChat] = await Sentry.startSpan(
      {
        name: 'insert chat',
        op: 'database.query',
      },
      async () => {
        return await db
          .insert(chats)
          .values({
            userId: user_id,
            title: sanitizedTitle,
          })
          .returning()
      },
    )

    consola.success('Chat created:', newChat.id)

    return {
      success: true,
      chat: newChat,
    }
  } catch (error) {
    consola.error('Error creating chat:', error)
    Sentry.captureException(error)

    throw createError({
      status: 500,
      message: 'Internal server error',
      statusMessage: 'Failed to create chat',
    })
  }
})
