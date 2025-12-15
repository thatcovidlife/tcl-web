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
 * Request body for checking bookmark status
 */
interface BookmarkStatusRequest {
  type: BookmarkType
  identifier: string
}

/**
 * Validates the request body for bookmark status check
 *
 * @param body - Request body to validate
 * @returns Validated bookmark data
 * @throws Error if validation fails
 */
function validateRequestBody(body: any): BookmarkStatusRequest {
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

  return {
    type: type as BookmarkType,
    identifier: identifier.trim(),
  }
}

/**
 * POST /api/bookmarks/status
 *
 * Checks if an item is bookmarked by the authenticated user.
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
 * true
 * ```
 * or
 * ```json
 * false
 * ```
 *
 * **Error Responses:**
 * - `401` Unauthorized - User not authenticated
 * - `400` Bad Request - Invalid request body
 * - `404` Not Found - User account not found
 * - `429` Too Many Requests - Rate limit exceeded
 * - `500` Internal Server Error - Server error
 */
export default defineEventHandler(async (event): Promise<boolean> => {
  const startTime = Date.now()

  // 1. Authentication check
  const { user: sessionUser } = await getUserSession(event)

  if (!sessionUser || !sessionUser.email) {
    consola.warn('Unauthorized bookmark status check attempt')
    throw createError({
      status: 401,
      message: 'Unauthorized',
      statusMessage: 'You must be logged in to check bookmark status',
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
        return await ratelimit.limit(`bookmarks:status:${sessionUser.email}`)
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
      `Checking bookmark status for user: ${sessionUser.email}, type: ${type}, identifier: ${identifier}`,
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

    // 5. Check if bookmark exists
    const [existingBookmark] = await Sentry.startSpan(
      {
        name: 'check bookmark status',
        op: 'database.query',
        attributes: {
          'db.user_id': user.id,
          'db.type': type,
          'db.identifier': identifier,
        },
      },
      async () => {
        return await db
          .select({ id: bookmarks.id })
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

    const isBookmarked = !!existingBookmark

    const duration = Date.now() - startTime

    // 6. Log metrics
    consola.success(
      `Bookmark status check for user: ${sessionUser.email}, type: ${type}, identifier: ${identifier} - ${isBookmarked ? 'found' : 'not found'} (${duration}ms)`,
    )

    Sentry.metrics.distribution('bookmarks.status.duration', duration, {
      unit: 'millisecond',
    })

    // 7. Return boolean result
    return isBookmarked
  } catch (error) {
    // Handle known errors (createError throws)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // Log and capture unexpected errors
    consola.error('Error checking bookmark status:', error)
    Sentry.captureException(error, {
      extra: {
        email: sessionUser?.email,
        body: await readBody(event).catch(() => null),
      },
    })

    throw createError({
      status: 500,
      message: 'Internal server error',
      statusMessage: 'An error occurred while checking bookmark status',
    })
  }
})
