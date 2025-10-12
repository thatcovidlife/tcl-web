# System Patterns

## Architecture

- Nuxt.js application with server-side API routes
- Sanity as headless CMS for content management
- Drizzle ORM for database operations
- Centralized state management with Pinia stores

## Database Operations

- All database queries use Drizzle ORM
- Database calls are wrapped with Sentry spans for observability
- Consistent error handling across all database operations

## Error Handling

- Sentry integration for error tracking and performance monitoring
- Consistent error patterns across API routes
- User context is set in Sentry when available

## API Patterns

- Server API routes follow consistent structure
- All API endpoints include proper error handling
- Database queries are wrapped with Sentry spans
- User authentication checks where required

## User Management

- User store handles profile updates and authentication
- Sentry user context is set when updating user information
- Consistent user data fetching patterns across the application
