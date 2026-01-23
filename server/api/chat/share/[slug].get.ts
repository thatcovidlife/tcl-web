import { consola } from 'consola'
import { db } from '@/lib/db'
import { sharedChats, chats, messages } from '@/lib/db/schema'
import { eq, and, or, isNull, gt, asc } from 'drizzle-orm'
import * as Sentry from '@sentry/nuxt'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Slug is required',
    })
  }

  try {
    // Fetch the shared chat with expiration check
    const result = await Sentry.startSpan(
      {
        name: 'get shared chat by slug',
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
            chat: {
              id: chats.id,
              title: chats.title,
              createdAt: chats.createdAt,
            },
          })
          .from(sharedChats)
          .innerJoin(chats, eq(sharedChats.chatId, chats.id))
          .where(
            and(
              eq(sharedChats.slug, slug),
              or(
                isNull(sharedChats.expiresAt),
                gt(sharedChats.expiresAt, new Date()),
              ),
            ),
          )
          .limit(1)
      },
    )

    const [sharedChat] = result

    if (!sharedChat) {
      throw createError({
        status: 404,
        message: 'Not found',
        statusMessage: 'Shared chat not found or has expired',
      })
    }

    // Increment view count
    await Sentry.startSpan(
      {
        name: 'increment view count',
        op: 'database.query',
      },
      async () => {
        await db
          .update(sharedChats)
          .set({ viewCount: sharedChat.viewCount + 1 })
          .where(eq(sharedChats.id, sharedChat.id))
      },
    )

    // Fetch all messages for this chat
    const chatMessages = await Sentry.startSpan(
      {
        name: 'get chat messages',
        op: 'database.query',
      },
      async () => {
        return await db
          .select({
            messageId: messages.messageId,
            role: messages.role,
            content: messages.content,
            parts: messages.parts,
          })
          .from(messages)
          .where(eq(messages.chatId, sharedChat.chat.id))
          .orderBy(asc(messages.createdAt))
      },
    )

    consola.success(
      `Retrieved shared chat ${slug} with ${chatMessages.length} messages`,
    )

    // Statsig analytics event
    // if (process.env.STATSIG_CLIENT_ID) {
    //   try {
    //     await $fetch('/api/analytics', {
    //       method: 'POST',
    //       body: {
    //         event: 'shared_chat_viewed',
    //         slug,
    //         chatId: sharedChat.chat.id,
    //         viewCount: sharedChat.viewCount + 1,
    //       },
    //     })
    //   } catch (analyticsError) {
    //     // Don't fail the request if analytics fails
    //     consola.warn('Failed to send analytics event:', analyticsError)
    //   }
    // }

    return {
      chat: {
        id: sharedChat.chat.id,
        title: sharedChat.chat.title,
        createdAt: sharedChat.chat.createdAt,
      },
      messages: chatMessages,
      shareInfo: {
        slug: sharedChat.slug,
        createdAt: sharedChat.createdAt,
        expiresAt: sharedChat.expiresAt,
        viewCount: sharedChat.viewCount + 1,
      },
    }
  } catch (error) {
    consola.error('Error retrieving shared chat:', error)

    // Re-throw if it's already a createError error
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    Sentry.captureException(error)

    throw createError({
      status: 500,
      message: 'Internal server error',
      statusMessage: 'Failed to retrieve shared chat',
    })
  }
})
