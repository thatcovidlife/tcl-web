import { consola } from 'consola'
import { db } from '@/lib/db'
import { bookmarks, users } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import * as Sentry from '@sentry/nuxt'
import { ratelimit } from '@/lib/chat/rate-limit'

/**
 * Response structure for bookmark filters
 */
interface BookmarkFiltersResponse {
  types: string[]
}

/**
 * GET /api/bookmarks/filters
 *
 * Retrieves unique bookmark types for the authenticated user.
 * This endpoint is useful for populating filter dropdowns or UI elements.
 *
 * **Authentication:** Required
 *
 * **Response:**
 * ```json
 * {
 *   "types": ["blog", "video", "scientific-library"]
 * }
 * ```
 *
 * **Error Responses:**
 * - `401` Unauthorized - User not authenticated
 * - `404` Not Found - User account not found
 * - `429` Too Many Requests - Rate limit exceeded
 * - `500` Internal Server Error - Server error
 *
 * @example
 * GET /api/bookmarks/filters
 *
 * Response:
 * {
 *   "types": ["scientific-library", "chat"]
 * }
 */
export default defineEventHandler(
  async (event): Promise<BookmarkFiltersResponse> => {
    const startTime = Date.now()

    // 1. Authentication check
    const { user: sessionUser } = await getUserSession(event)

    if (!sessionUser || !sessionUser.email) {
      consola.warn('Unauthorized bookmark filters access attempt')
      throw createError({
        status: 401,
        message: 'Unauthorized',
        statusMessage: 'You must be logged in to view bookmark filters',
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
          return await ratelimit.limit(`bookmarks:filters:${sessionUser.email}`)
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

      consola.info(`Fetching bookmark filters for user: ${sessionUser.email}`)

      // 3. Get user ID from email
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

      // 4. Fetch distinct bookmark types for user
      const distinctTypes = await Sentry.startSpan(
        {
          name: 'fetch distinct bookmark types',
          op: 'database.query',
          attributes: {
            'db.user_id': user.id,
          },
        },
        async () => {
          return await db
            .selectDistinct({ type: bookmarks.type })
            .from(bookmarks)
            .where(eq(bookmarks.userId, user.id))
            .orderBy(bookmarks.type)
        },
      )

      const types = distinctTypes.map((row) => row.type)

      const duration = Date.now() - startTime

      // 5. Log performance metrics
      consola.success(
        `Fetched ${types.length} bookmark types for user: ${sessionUser.email} in ${duration}ms`,
      )

      Sentry.metrics.distribution('bookmarks.filters.duration', duration, {
        unit: 'millisecond',
      })

      // 6. Return response
      return {
        types,
      }
    } catch (error) {
      // Handle known errors (createError throws)
      if (error && typeof error === 'object' && 'statusCode' in error) {
        throw error
      }

      // Log and capture unexpected errors
      consola.error('Error fetching bookmark filters:', error)
      Sentry.captureException(error, {
        extra: {
          email: sessionUser?.email,
        },
      })

      throw createError({
        status: 500,
        message: 'Internal server error',
        statusMessage: 'An error occurred while fetching bookmark filters',
      })
    }
  },
)
