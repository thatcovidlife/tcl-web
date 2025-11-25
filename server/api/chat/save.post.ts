import { consola } from 'consola'
import { db } from '@/lib/db'
import { messages, chats } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import * as Sentry from '@sentry/nuxt'
import { sanitizeChatMessage } from '@/lib/utils'

export default defineEventHandler(async (event) => {
  // Bypass XSS validator for this endpoint since chat messages may contain markdown/HTML
  event.node.req.headers['x-skip-xss-validator'] = 'true'

  const { user: sessionUser } = await getUserSession(event)

  const body = await readBody(event)
  const { chat_id, messages: messageArray } = body

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
    consola.success('All messages validated successfully')

    // Sanitize and prepare messages before database insertion
    const messagesToInsert: Array<{
      chatId: string
      messageId: string
      content: string
      role: 'user' | 'assistant'
      parts: any[]
    }> = []

    for (const msg of messageArray) {
      // Only sanitize user messages; LLM-generated content is trusted
      let content = msg.content

      if (msg.role === 'user') {
        const sanitizationResult = sanitizeChatMessage(msg.content)

        if (!sanitizationResult.isValid) {
          consola.warn(
            'Message sanitization failed:',
            sanitizationResult.errors,
          )
          throw createError({
            status: 400,
            message: 'Bad request',
            statusMessage:
              'Invalid message content: ' +
              sanitizationResult.errors.join(', '),
          })
        }

        if (sanitizationResult.warnings.length > 0) {
          consola.warn(
            'Message sanitization warnings:',
            sanitizationResult.warnings,
          )
        }

        content = sanitizationResult.sanitized
      }

      messagesToInsert.push({
        chatId: chat_id,
        messageId: msg.id || crypto.randomUUID(),
        content,
        role: msg.role as 'user' | 'assistant',
        parts: msg.parts || [],
      })
    }

    // Save messages to database
    const savedMessages = await Sentry.startSpan(
      {
        name: 'insert messages',
        op: 'database.query',
      },
      async () => {
        const result = await db
          .insert(messages)
          .values(messagesToInsert)
          .returning()
        return result
      },
    )

    consola.success(`Saved ${savedMessages.length} messages to chat ${chat_id}`)

    consola.success('Returning response to client')
    return {
      success: true,
      messages: savedMessages,
      count: savedMessages.length,
    }
  } catch (error) {
    consola.error('Error saving messages:', error)
    consola.error('Error type:', typeof error)
    consola.error('Error details:', JSON.stringify(error, null, 2))
    Sentry.captureException(error)

    // Re-throw if it's already a createError
    if (error && typeof error === 'object' && 'statusCode' in error) {
      consola.error(
        'Re-throwing createError with statusCode:',
        (error as any).statusCode,
      )
      throw error
    }

    consola.error('Throwing generic 500 error')
    throw createError({
      status: 500,
      message: 'Internal server error',
      statusMessage: 'Failed to save messages',
    })
  }
})
