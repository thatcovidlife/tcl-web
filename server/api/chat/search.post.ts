import { consola } from 'consola'
import { db } from '@/lib/db'
import { chats, messages, users } from '@/lib/db/schema'
import { eq, or, ilike, and, sql, desc, asc } from 'drizzle-orm'
import * as Sentry from '@sentry/nuxt'
import { sanitizeMarkdown } from '@/assets/utils/sanitize-markdown'

interface SearchResult {
  chatId: string
  title: string
  createdAt: Date
  preview: string
}

interface PaginatedResponse {
  success: boolean
  data: SearchResult[]
  pagination: {
    limit: number
    offset: number
    total: number
    hasMore: boolean
    currentPage: number
    totalPages: number
  }
}

export default defineEventHandler(async (event): Promise<PaginatedResponse> => {
  // Validate user authentication
  const { user: sessionUser } = await getUserSession(event)

  if (!sessionUser) {
    throw createError({
      status: 401,
      message: 'Unauthorized',
      statusMessage: 'You must be logged in to search chats',
    })
  }

  // Get search parameters from request body
  const body = await readBody(event)
  const { search = '', page = 1, pageSize = 10 } = body

  if (typeof search !== 'string') {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Search parameter must be a string',
    })
  }

  const pageNum = Math.max(1, Number(page) || 1)
  const pageSizeNum = Math.min(100, Math.max(1, Number(pageSize) || 10))
  const offset = (pageNum - 1) * pageSizeNum

  try {
    // Get the user ID from the database using the email
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

    // If search is empty, return all chats for the user
    if (!search.trim()) {
      const [userChats, [countResult]] = await Promise.all([
        Sentry.startSpan(
          {
            name: 'get user chats',
            op: 'database.query',
          },
          async () => {
            return await db
              .select()
              .from(chats)
              .where(eq(chats.userId, dbUser.id))
              .orderBy(desc(chats.createdAt))
              .limit(pageSizeNum)
              .offset(offset)
          },
        ),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(chats)
          .where(eq(chats.userId, dbUser.id)),
      ])

      const results: SearchResult[] = await Promise.all(
        userChats.map(async (chat) => {
          // Get the first assistant message for preview
          const [firstAssistantMessage] = await db
            .select({
              content: messages.content,
            })
            .from(messages)
            .where(
              and(eq(messages.chatId, chat.id), eq(messages.role, 'assistant')),
            )
            .orderBy(asc(messages.createdAt))
            .limit(1)

          // Extract first 300 characters and sanitize
          let preview = ''
          if (firstAssistantMessage?.content) {
            const rawContent = firstAssistantMessage.content.substring(0, 300)
            preview = sanitizeMarkdown(rawContent)
            if (preview.length > 300) {
              preview = preview.substring(0, 300) + '...'
            }
          }

          return {
            chatId: chat.id,
            title: chat.title,
            createdAt: chat.createdAt,
            preview,
          }
        }),
      )

      const total = countResult?.count || 0
      const hasMore = offset + pageSizeNum < total
      const totalPages = Math.ceil(total / pageSizeNum)

      consola.success(
        `Retrieved ${results.length} chats for user ${dbUser.id} (limit: ${pageSizeNum}, offset: ${offset})`,
      )

      return {
        success: true,
        data: results,
        pagination: {
          limit: pageSizeNum,
          offset,
          total,
          hasMore,
          currentPage: Math.floor(offset / pageSizeNum) + 1,
          totalPages,
        },
      }
    }

    // Search in both chat titles and message content
    const searchPattern = `%${search.trim()}%`

    // Get all chats that match the search criteria
    const matchingChats = await Sentry.startSpan(
      {
        name: 'search chats',
        op: 'database.query',
      },
      async () => {
        return await db
          .selectDistinct({
            chatId: chats.id,
            title: chats.title,
            createdAt: chats.createdAt,
          })
          .from(chats)
          .leftJoin(messages, eq(messages.chatId, chats.id))
          .where(
            and(
              eq(chats.userId, dbUser.id),
              or(
                ilike(chats.title, searchPattern),
                ilike(messages.content, searchPattern),
              ),
            ),
          )
          .orderBy(desc(chats.createdAt))
      },
    )

    // Calculate pagination
    const total = matchingChats.length
    const totalPages = Math.ceil(total / pageSizeNum)
    const paginatedChats = matchingChats.slice(offset, offset + pageSizeNum)

    // Get message snippets for each chat
    const results: SearchResult[] = await Promise.all(
      paginatedChats.map(async (chat) => {
        // Get the first assistant message for preview
        const [firstAssistantMessage] = await db
          .select({
            content: messages.content,
          })
          .from(messages)
          .where(
            and(
              eq(messages.chatId, chat.chatId),
              eq(messages.role, 'assistant'),
            ),
          )
          .orderBy(asc(messages.createdAt))
          .limit(1)

        // Extract first 300 characters and sanitize
        let preview = ''
        if (firstAssistantMessage?.content) {
          const rawContent = firstAssistantMessage.content.substring(0, 300)
          preview = sanitizeMarkdown(rawContent)
          if (preview.length > 300) {
            preview = preview.substring(0, 300) + '...'
          }
        }

        return {
          chatId: chat.chatId,
          title: chat.title,
          createdAt: chat.createdAt,
          preview,
        }
      }),
    )

    const hasMore = offset + pageSizeNum < total

    consola.success(
      `Found ${total} chats matching "${search}" for user ${dbUser.id} (limit: ${pageSizeNum}, offset: ${offset})`,
    )

    return {
      success: true,
      data: results,
      pagination: {
        limit: pageSizeNum,
        offset,
        total,
        hasMore,
        currentPage: Math.floor(offset / pageSizeNum) + 1,
        totalPages,
      },
    }
  } catch (error) {
    consola.error('Error searching chats:', error)

    // Re-throw if it's already a createError error
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    Sentry.captureException(error)

    throw createError({
      status: 500,
      message: 'Internal server error',
      statusMessage: 'Failed to search chats',
    })
  }
})
