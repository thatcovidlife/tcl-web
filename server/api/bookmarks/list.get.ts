import { consola } from 'consola'
import { db } from '@/lib/db'
import { bookmarks, users } from '@/lib/db/schema'
import { eq, and, desc, asc, sql, count } from 'drizzle-orm'
import * as Sentry from '@sentry/nuxt'
import { ratelimit } from '@/lib/chat/rate-limit'

/**
 * Bookmark sort fields supported by the API
 */
type BookmarkSortField = 'createdAt' | 'type'

/**
 * Sort order supported by the API
 */
type SortOrder = 'asc' | 'desc'

/**
 * Bookmark type filter values
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
 * Query parameters for bookmark list endpoint
 */
interface BookmarkListQuery {
  page?: string
  limit?: string
  sortBy?: BookmarkSortField
  order?: SortOrder
  type?: BookmarkType
}

/**
 * Paginated response structure for bookmarks
 */
interface PaginatedBookmarksResponse {
  bookmarks: Array<{
    id: string
    createdAt: Date
    type: string
    identifier: string
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

/**
 * Validates and parses pagination parameters
 *
 * @param page - Page number from query string
 * @param limit - Page size from query string
 * @returns Validated pagination parameters
 * @throws Error if parameters are invalid
 */
function validatePagination(page?: string, limit?: string) {
  const parsedPage = page ? parseInt(page, 10) : 1
  const parsedLimit = limit ? parseInt(limit, 10) : 20

  if (isNaN(parsedPage) || parsedPage < 1) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Page must be a positive integer',
    })
  }

  if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Limit must be between 1 and 100',
    })
  }

  return { page: parsedPage, limit: parsedLimit }
}

/**
 * Validates sort parameters
 *
 * @param sortBy - Field to sort by
 * @param order - Sort order (asc/desc)
 * @returns Validated sort parameters
 * @throws Error if parameters are invalid
 */
function validateSorting(sortBy?: string, order?: string) {
  const validSortFields: BookmarkSortField[] = ['createdAt', 'type']
  const validOrders: SortOrder[] = ['asc', 'desc']

  const parsedSortBy = (sortBy || 'createdAt') as BookmarkSortField
  const parsedOrder = (order || 'desc') as SortOrder

  if (!validSortFields.includes(parsedSortBy)) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: `Invalid sortBy parameter. Must be one of: ${validSortFields.join(', ')}`,
    })
  }

  if (!validOrders.includes(parsedOrder)) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Invalid order parameter. Must be "asc" or "desc"',
    })
  }

  return { sortBy: parsedSortBy, order: parsedOrder }
}

/**
 * Validates bookmark type filter
 *
 * @param type - Bookmark type to filter by
 * @returns Validated type or undefined
 * @throws Error if type is invalid
 */
function validateType(type?: string) {
  if (!type) return undefined

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
      statusMessage: `Invalid type parameter. Must be one of: ${validTypes.join(', ')}`,
    })
  }

  return type as BookmarkType
}

/**
 * GET /api/bookmarks/list
 *
 * Retrieves a paginated list of bookmarks for the authenticated user.
 *
 * **Authentication:** Required
 *
 * **Query Parameters:**
 * - `page` (optional): Page number (default: 1, min: 1)
 * - `limit` (optional): Items per page (default: 20, min: 1, max: 100)
 * - `sortBy` (optional): Sort field - "createdAt" | "type" (default: "createdAt")
 * - `order` (optional): Sort order - "asc" | "desc" (default: "desc")
 * - `type` (optional): Filter by bookmark type - "blog" | "chat" | "covidnet" | "directory" | "event" | "product" | "resource" | "scientific-library" | "video"
 *
 * **Response:**
 * ```json
 * {
 *   "bookmarks": [
 *     {
 *       "id": "uuid",
 *       "createdAt": "2025-12-15T00:00:00.000Z",
 *       "type": "blog",
 *       "identifier": "article-slug"
 *     }
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 20,
 *     "total": 42,
 *     "totalPages": 3,
 *     "hasNextPage": true,
 *     "hasPrevPage": false
 *   }
 * }
 * ```
 *
 * **Error Responses:**
 * - `401` Unauthorized - User not authenticated
 * - `400` Bad Request - Invalid query parameters
 * - `429` Too Many Requests - Rate limit exceeded
 * - `500` Internal Server Error - Server error
 *
 * @example
 * // Fetch first page with default settings
 * GET /api/bookmarks/list
 *
 * @example
 * // Fetch second page, 10 items, sorted by type ascending
 * GET /api/bookmarks/list?page=2&limit=10&sortBy=type&order=asc
 *
 * @example
 * // Filter by blog bookmarks only
 * GET /api/bookmarks/list?type=blog
 */
export default defineEventHandler(
  async (event): Promise<PaginatedBookmarksResponse> => {
    const startTime = Date.now()

    // 1. Authentication check
    const { user: sessionUser } = await getUserSession(event)

    if (!sessionUser || !sessionUser.email) {
      consola.warn('Unauthorized bookmark list access attempt')
      throw createError({
        status: 401,
        message: 'Unauthorized',
        statusMessage: 'You must be logged in to view bookmarks',
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
          return await ratelimit.limit(`bookmarks:list:${sessionUser.email}`)
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

      // 3. Parse and validate query parameters
      const query = getQuery<BookmarkListQuery>(event)
      const { page, limit } = validatePagination(query.page, query.limit)
      const { sortBy, order } = validateSorting(query.sortBy, query.order)
      const typeFilter = validateType(query.type)

      consola.info(
        `Fetching bookmarks for user: ${sessionUser.email}, page: ${page}, limit: ${limit}, sortBy: ${sortBy}, order: ${order}, type: ${typeFilter || 'all'}`,
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

      // 5. Build where conditions
      const whereConditions = typeFilter
        ? and(eq(bookmarks.userId, user.id), eq(bookmarks.type, typeFilter))
        : eq(bookmarks.userId, user.id)

      // 6. Get total count (for pagination metadata)
      const [totalResult] = await Sentry.startSpan(
        {
          name: 'count bookmarks',
          op: 'database.query',
          attributes: {
            'db.user_id': user.id,
            'db.type_filter': typeFilter || 'none',
          },
        },
        async () => {
          return await db
            .select({ count: count() })
            .from(bookmarks)
            .where(whereConditions)
        },
      )

      const total = totalResult?.count || 0

      // Handle empty result set
      if (total === 0) {
        consola.info(
          `No bookmarks found for user: ${sessionUser.email}, type: ${typeFilter || 'all'}`,
        )
        return {
          bookmarks: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        }
      }

      // 7. Calculate pagination metadata
      const totalPages = Math.ceil(total / limit)
      const offset = (page - 1) * limit

      // Validate page doesn't exceed total pages
      if (page > totalPages) {
        throw createError({
          status: 400,
          message: 'Bad request',
          statusMessage: `Page ${page} exceeds total pages (${totalPages})`,
        })
      }

      // 8. Determine sort column and order
      const sortColumn =
        sortBy === 'type' ? bookmarks.type : bookmarks.createdAt
      const orderFn = order === 'asc' ? asc : desc

      // 9. Fetch bookmarks with optimized query
      const userBookmarks = await Sentry.startSpan(
        {
          name: 'fetch bookmarks',
          op: 'database.query',
          attributes: {
            'db.user_id': user.id,
            'db.page': page,
            'db.limit': limit,
            'db.sort_by': sortBy,
            'db.order': order,
            'db.type_filter': typeFilter || 'none',
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
            .where(whereConditions)
            .orderBy(orderFn(sortColumn))
            .limit(limit)
            .offset(offset)
        },
      )

      const duration = Date.now() - startTime

      // 10. Log performance metrics
      consola.success(
        `Fetched ${userBookmarks.length} bookmarks for user: ${sessionUser.email} in ${duration}ms`,
      )

      Sentry.metrics.distribution('bookmarks.list.duration', duration, {
        unit: 'millisecond',
      })

      // 11. Return paginated response
      return {
        bookmarks: userBookmarks,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      }
    } catch (error) {
      // Handle known errors (createError throws)
      if (error && typeof error === 'object' && 'statusCode' in error) {
        throw error
      }

      // Log and capture unexpected errors
      consola.error('Error fetching bookmarks:', error)
      Sentry.captureException(error, {
        extra: {
          email: sessionUser?.email,
          query: getQuery(event),
        },
      })

      throw createError({
        status: 500,
        message: 'Internal server error',
        statusMessage: 'An error occurred while fetching bookmarks',
      })
    }
  },
)
