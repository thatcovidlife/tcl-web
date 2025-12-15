import { consola } from 'consola'
import { db } from '@/lib/db'
import { bookmarks, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import * as Sentry from '@sentry/nuxt'
import { ratelimit } from '@/lib/chat/rate-limit'

/**
 * Bookmark type values
 */
type BookmarkType =
  | 'blog'
  | 'chat'
  | 'covidnet'
  | 'directory'
  | 'event'
  | 'product'
  | 'resource'
  | 'scientific-library'
  | 'video'

/**
 * Request body for creating a bookmark
 */
interface CreateBookmarkRequest {
  type: BookmarkType
  identifier: string
}

/**
 * Response structure for bookmark creation
 */
interface CreateBookmarkResponse {
  success: boolean
  bookmark: {
    id: string
    createdAt: Date
    type: string
    identifier: string
  }
  isNew: boolean
}

/**
 * Validates the request body for bookmark creation
 *
 * @param body - Request body to validate
 * @returns Validated bookmark data
 * @throws Error if validation fails
 */
function validateRequestBody(body: any): CreateBookmarkRequest {
  if (!body || typeof body !== 'object') {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Request body is required',
    })
  }

  const { type, identifier } = body

  if (!type || typeof type !== 'string') {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Type is required and must be a string',
    })
  }

  if (!identifier || typeof identifier !== 'string') {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Identifier is required and must be a string',
    })
  }

  const validTypes: BookmarkType[] = [
    'blog',
    'chat',
    'covidnet',
    'directory',
    'event',
    'product',
    'resource',
    'scientific-library',
    'video',
  ]

  if (!validTypes.includes(type as BookmarkType)) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
    })
  }

  if (identifier.trim().length === 0) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Identifier cannot be empty',
    })
  }

  if (identifier.length > 1000) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Identifier must be less than 1000 characters',
    })
  }

  return {
    type: type as BookmarkType,
    identifier: identifier.trim(),
  }
}

/**
 * POST /api/bookmarks
 *
 * Creates a new bookmark for the authenticated user.
 *
 * **Authentication:** Required
 *
 * **Request Body:**
 * ```json
 * {
 *   "type": "blog",
 *   "identifier": "article-slug-or-id"
 * }
 * ```
 *
 * **Response:**
 * ```json
 * {
 *   "success": true,
 *   "bookmark": {
 *     "id": "uuid",
 *     "createdAt": "2025-12-15T00:00:00.000Z",
 *     "type": "blog",
 *     "identifier": "article-slug-or-id"
 *   },
 *   "isNew": true
 * }
 * ```
 *
 * **Error Responses:**
 * - `401` Unauthorized - User not authenticated
 * - `400` Bad Request - Invalid request body
 * - `429` Too Many Requests - Rate limit exceeded
 * - `500` Internal Server Error - Server error
 *
 * **Idempotency:**
 * If a bookmark with the same type and identifier already exists for the user,
 * the existing bookmark is returned with `isNew: false`.
 *
 * @example
 * POST /api/bookmarks
 * {
 *   "type": "blog",
 *   "identifier": "covid-research-2025"
 * }
 */
export default defineEventHandler(
  async (event): Promise<CreateBookmarkResponse> => {
    const startTime = Date.now()

    // 1. Authentication check
    const { user: sessionUser } = await getUserSession(event)

    if (!sessionUser || !sessionUser.email) {
      consola.warn('Unauthorized bookmark creation attempt')
      throw createError({
        status: 401,
        message: 'Unauthorized',
        statusMessage: 'You must be logged in to create bookmarks',
      })
    }

    try {
      // 2. Rate limiting
      const { success, remaining, reset } = await Sentry.startSpan(
        {
          name: 'rate limit check',
          op: 'ratelimit.check',
        },
        async () => {
          return await ratelimit.limit(`bookmarks:create:${sessionUser.email}`)
        },
      )

      if (!success && process.env.NODE_ENV !== 'development') {
        const resetTime = new Date(reset)
        consola.warn(
          `Rate limit exceeded for user: ${sessionUser.email}, remaining: ${remaining}, reset: ${resetTime.toISOString()}`,
        )

        setResponseHeader(event, 'X-RateLimit-Remaining', remaining.toString())
        setResponseHeader(event, 'X-RateLimit-Reset', reset.toString())

        throw createError({
          status: 429,
          message: 'Too many requests',
          statusMessage: `Rate limit exceeded. Try again after ${resetTime.toISOString()}. Remaining queries: ${remaining}`,
        })
      }

      // Set rate limit headers
      setResponseHeader(event, 'X-RateLimit-Remaining', remaining.toString())
      if (reset) {
        setResponseHeader(event, 'X-RateLimit-Reset', reset.toString())
      }

      // 3. Parse and validate request body
      const body = await readBody(event)
      const { type, identifier } = validateRequestBody(body)

      consola.info(
        `Creating bookmark for user: ${sessionUser.email}, type: ${type}, identifier: ${identifier}`,
      )

      // 4. Get user ID from email
      const [user] = await Sentry.startSpan(
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

      if (!user) {
        consola.error(`User not found for email: ${sessionUser.email}`)
        Sentry.captureMessage('User authenticated but not found in database', {
          level: 'error',
          extra: { email: sessionUser.email },
        })

        throw createError({
          status: 404,
          message: 'Not found',
          statusMessage: 'User account not found',
        })
      }

      // 5. Check for existing bookmark (idempotency)
      const [existingBookmark] = await Sentry.startSpan(
        {
          name: 'check existing bookmark',
          op: 'database.query',
          attributes: {
            'db.user_id': user.id,
            'db.type': type,
            'db.identifier': identifier,
          },
        },
        async () => {
          return await db
            .select({
              id: bookmarks.id,
              createdAt: bookmarks.createdAt,
              type: bookmarks.type,
              identifier: bookmarks.identifier,
            })
            .from(bookmarks)
            .where(
              and(
                eq(bookmarks.userId, user.id),
                eq(bookmarks.type, type),
                eq(bookmarks.identifier, identifier),
              ),
            )
            .limit(1)
        },
      )

      // If bookmark already exists, return it
      if (existingBookmark) {
        const duration = Date.now() - startTime
        consola.info(
          `Bookmark already exists for user: ${sessionUser.email}, type: ${type}, identifier: ${identifier} (${duration}ms)`,
        )

        Sentry.metrics.distribution('bookmarks.create.duration', duration, {
          unit: 'millisecond',
        })

        return {
          success: true,
          bookmark: existingBookmark,
          isNew: false,
        }
      }

      // 6. Create new bookmark
      const [newBookmark] = await Sentry.startSpan(
        {
          name: 'create bookmark',
          op: 'database.query',
          attributes: {
            'db.user_id': user.id,
            'db.type': type,
            'db.identifier': identifier,
          },
        },
        async () => {
          return await db
            .insert(bookmarks)
            .values({
              userId: user.id,
              type,
              identifier,
            })
            .returning({
              id: bookmarks.id,
              createdAt: bookmarks.createdAt,
              type: bookmarks.type,
              identifier: bookmarks.identifier,
            })
        },
      )

      const duration = Date.now() - startTime

      // 7. Log success metrics
      consola.success(
        `Created bookmark for user: ${sessionUser.email}, type: ${type}, identifier: ${identifier} in ${duration}ms`,
      )

      Sentry.metrics.distribution('bookmarks.create.duration', duration, {
        unit: 'millisecond',
      })

      // 8. Return success response
      return {
        success: true,
        bookmark: newBookmark,
        isNew: true,
      }
    } catch (error) {
      // Handle known errors (createError throws)
      if (error && typeof error === 'object' && 'statusCode' in error) {
        throw error
      }

      // Log and capture unexpected errors
      consola.error('Error creating bookmark:', error)
      Sentry.captureException(error, {
        extra: {
          email: sessionUser?.email,
          body: await readBody(event).catch(() => null),
        },
      })

      throw createError({
        status: 500,
        message: 'Internal server error',
        statusMessage: 'An error occurred while creating the bookmark',
      })
    }
  },
)
