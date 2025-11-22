import { consola } from 'consola'
import { db } from '@/lib/db'
import { messages, chats } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import * as Sentry from '@sentry/nuxt'

export default defineEventHandler(async (event) => {
  // Bypass XSS validator for this endpoint since chat messages may contain markdown/HTML
  event.node.req.headers['x-skip-xss-validator'] = 'true'

  const { user: sessionUser } = await getUserSession(event)
  const { chat_id, messages: messageArray } = await readBody(event)

  if (!chat_id || !messageArray || !Array.isArray(messageArray)) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'chat_id and messages array are required',
    })
  }

  if (!sessionUser) {
    throw createError({
      status: 401,
      message: 'Unauthorized',
      statusMessage: 'You must be logged in to save messages',
    })
  }

  try {
    // Verify the chat exists and belongs to the user
    const [existingChat] = await Sentry.startSpan(
      {
        name: 'get chat by id',
        op: 'database.query',
      },
      async () => {
        return await db
          .select()
          .from(chats)
          .where(eq(chats.id, chat_id))
          .limit(1)
      },
    )

    if (!existingChat) {
      throw createError({
        status: 404,
        message: 'Not found',
        statusMessage: 'Chat not found',
      })
    }

    // Verify ownership through email match
    const { users } = await import('@/lib/db/schema')
    const [chatOwner] = await Sentry.startSpan(
      {
        name: 'verify chat ownership',
        op: 'database.query',
      },
      async () => {
        return await db
          .select({
            chat: chats,
            user: users,
          })
          .from(chats)
          .innerJoin(users, eq(chats.userId, users.id))
          .where(eq(chats.id, chat_id))
          .limit(1)
      },
    )

    if (!chatOwner || chatOwner.user.email !== sessionUser.email) {
      throw createError({
        status: 403,
        message: 'Forbidden',
        statusMessage: 'You are not authorized to save messages to this chat',
      })
    }

    // Validate message structure
    for (const msg of messageArray) {
      if (!msg.role || !msg.content) {
        consola.error('Invalid message structure:', msg)
        throw createError({
          status: 400,
          message: 'Bad request',
          statusMessage: `Each message must have role and content fields. Received: ${JSON.stringify(msg)}`,
        })
      }

      if (!['user', 'assistant'].includes(msg.role)) {
        consola.error('Invalid message role:', msg.role)
        throw createError({
          status: 400,
          message: 'Bad request',
          statusMessage: 'Message role must be either "user" or "assistant"',
        })
      }
    }

    // Save messages to database
    const savedMessages = await Sentry.startSpan(
      {
        name: 'insert messages',
        op: 'database.query',
      },
      async () => {
        const messagesToInsert = messageArray.map((msg) => ({
          chatId: chat_id,
          messageId: msg.id || crypto.randomUUID(),
          content: msg.content,
          role: msg.role as 'user' | 'assistant',
          parts: msg.parts || [],
        }))

        return await db.insert(messages).values(messagesToInsert).returning()
      },
    )

    consola.success(`Saved ${savedMessages.length} messages to chat ${chat_id}`)

    return {
      success: true,
      messages: savedMessages,
      count: savedMessages.length,
    }
  } catch (error) {
    consola.error('Error saving messages:', error)
    Sentry.captureException(error)

    // Re-throw if it's already a createError
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      status: 500,
      message: 'Internal server error',
      statusMessage: 'Failed to save messages',
    })
  }
})
