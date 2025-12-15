# Bookmarks API Endpoint

## Overview

The Bookmarks List API endpoint provides secure, paginated access to user bookmarks with comprehensive filtering, sorting, and performance optimizations.

## Endpoint

```
GET /api/bookmarks/list
```

## Features

✅ **Secure Authentication** - Requires valid user session  
✅ **Rate Limiting** - Prevents API abuse with Upstash rate limiting  
✅ **Input Validation** - Comprehensive query parameter validation  
✅ **Pagination** - Efficient pagination with metadata  
✅ **Sorting** - Sort by creation date or type  
✅ **Filtering** - Filter by bookmark type  
✅ **Performance Optimized** - Database indexes for fast queries  
✅ **Error Handling** - Detailed error responses with proper HTTP codes  
✅ **Monitoring** - Sentry integration for logging and metrics  
✅ **Type Safety** - Full TypeScript support  
✅ **Tested** - Comprehensive test suite

## Authentication

**Required:** Yes

Users must be authenticated via Auth0 session. Unauthenticated requests return `401 Unauthorized`.

## Query Parameters

| Parameter | Type   | Default   | Required | Description                               |
| --------- | ------ | --------- | -------- | ----------------------------------------- |
| `page`    | number | 1         | No       | Page number (min: 1)                      |
| `limit`   | number | 20        | No       | Items per page (min: 1, max: 100)         |
| `sortBy`  | string | createdAt | No       | Sort field: `createdAt` or `type`         |
| `order`   | string | desc      | No       | Sort order: `asc` or `desc`               |
| `type`    | string | (all)     | No       | Filter by type (see Bookmark Types below) |

### Bookmark Types

Valid values for the `type` parameter:

- `blog`
- `chat`
- `covidnet`
- `directory`
- `event`
- `product`
- `resource`
- `scientific-library`
- `video`

## Response Format

### Success Response (200 OK)

```json
{
  "bookmarks": [
    {
      "id": "uuid-string",
      "createdAt": "2025-12-15T10:00:00.000Z",
      "type": "blog",
      "identifier": "article-slug"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Response Headers

| Header                  | Description                      |
| ----------------------- | -------------------------------- |
| `X-RateLimit-Remaining` | Number of requests remaining     |
| `X-RateLimit-Reset`     | Timestamp when rate limit resets |

## Error Responses

### 400 Bad Request

Invalid query parameters or page exceeds total pages.

```json
{
  "statusCode": 400,
  "message": "Bad request",
  "statusMessage": "Page must be a positive integer"
}
```

### 401 Unauthorized

User not authenticated.

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "statusMessage": "You must be logged in to view bookmarks"
}
```

### 404 Not Found

User account not found in database (rare edge case).

```json
{
  "statusCode": 404,
  "message": "Not found",
  "statusMessage": "User account not found"
}
```

### 429 Too Many Requests

Rate limit exceeded.

```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "statusMessage": "Rate limit exceeded. Try again after 2025-12-15T10:05:00.000Z. Remaining queries: 0"
}
```

### 500 Internal Server Error

Unexpected server error.

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "statusMessage": "An error occurred while fetching bookmarks"
}
```

## Usage Examples

### Basic Request (Default Pagination)

```bash
curl -X GET 'https://thatcovid.life/api/bookmarks/list' \
  -H 'Cookie: auth-token=...'
```

### Custom Pagination

```bash
curl -X GET 'https://thatcovid.life/api/bookmarks/list?page=2&limit=10' \
  -H 'Cookie: auth-token=...'
```

### Filter by Type

```bash
curl -X GET 'https://thatcovid.life/api/bookmarks/list?type=blog' \
  -H 'Cookie: auth-token=...'
```

### Sort by Type (Ascending)

```bash
curl -X GET 'https://thatcovid.life/api/bookmarks/list?sortBy=type&order=asc' \
  -H 'Cookie: auth-token=...'
```

### Combined Filters

```bash
curl -X GET 'https://thatcovid.life/api/bookmarks/list?type=video&sortBy=createdAt&order=asc&page=1&limit=5' \
  -H 'Cookie: auth-token=...'
```

### JavaScript/TypeScript (with Nuxt)

```typescript
// Using the useApiRoutes composable (to be extended)
const { data, error } = await useFetch('/api/bookmarks/list', {
  query: {
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    order: 'desc',
    type: 'blog',
  },
})

if (error.value) {
  console.error('Failed to fetch bookmarks:', error.value)
} else {
  console.log('Bookmarks:', data.value.bookmarks)
  console.log('Pagination:', data.value.pagination)
}
```

## Performance

### Database Indexes

The endpoint benefits from the following database indexes:

- `idx_bookmark_user_id` - Fast user filtering
- `idx_bookmark_user_created` - Optimized sorting by creation date
- `idx_bookmark_user_type` - Efficient type filtering
- `idx_bookmark_user_type_created` - Combined type filter + date sort

### Query Optimization

- **N+1 Prevention**: Single query fetches all needed data
- **Pagination**: LIMIT/OFFSET prevents loading all records
- **Count Optimization**: Separate count query with WHERE clause
- **Index Coverage**: All common query patterns use indexes

### Rate Limiting

- Uses Upstash Redis with sliding window algorithm
- Configured via `@/lib/chat/rate-limit.ts`
- Limits applied per user email
- Development mode bypasses rate limiting

### Monitoring

All requests are tracked with Sentry:

- Span tracking for database queries
- Performance metrics (`bookmarks.list.duration`)
- Error capturing with context
- User identification for debugging

## Testing

Run the test suite:

```bash
yarn test tests/server/api/bookmarks/list.get.spec.ts
```

### Test Coverage

- ✅ Authentication checks
- ✅ Pagination validation
- ✅ Sorting validation
- ✅ Type filtering
- ✅ Response structure
- ✅ Edge cases (empty results, invalid pages)
- ✅ Error handling
- ✅ Performance benchmarks

## Database Migration

Apply the performance indexes:

```bash
yarn db:migrate
```

Or manually run:

```bash
yarn db:push
```

The migration file is located at:
`lib/db/migrations/0006_add_bookmark_indexes.sql`

## Related Files

| File                                              | Purpose                      |
| ------------------------------------------------- | ---------------------------- |
| `server/api/bookmarks/list.get.ts`                | Endpoint implementation      |
| `tests/server/api/bookmarks/list.get.spec.ts`     | Test suite                   |
| `lib/db/schema/index.ts`                          | Database schema with indexes |
| `lib/db/migrations/0006_add_bookmark_indexes.sql` | Index migration              |
| `lib/chat/rate-limit.ts`                          | Rate limiting configuration  |

## Future Enhancements

Potential improvements:

1. **Caching**: Redis cache for frequently accessed pages
2. **Search**: Full-text search on identifier field
3. **Bulk Operations**: Fetch multiple bookmark details in one request
4. **Export**: CSV/JSON export functionality
5. **Analytics**: Track most bookmarked content
6. **Favorites**: Pin important bookmarks to top
7. **Tags**: Additional metadata for organization
8. **Sharing**: Share bookmark collections with others

## Security Considerations

- ✅ Authentication required for all requests
- ✅ Users can only access their own bookmarks
- ✅ SQL injection prevention via Drizzle ORM
- ✅ Rate limiting prevents abuse
- ✅ Input validation prevents malicious queries
- ✅ Error messages don't leak sensitive information
- ✅ All errors logged to Sentry for monitoring

## Support

For issues or questions:

1. Check Sentry for error logs
2. Review test suite for expected behavior
3. Verify database indexes are applied
4. Check rate limit configuration
5. Ensure Auth0 session is valid

---

**Last Updated:** December 15, 2025  
**API Version:** 1.0.0  
**Maintainer:** That Covid Life Development Team
