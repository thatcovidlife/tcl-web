# Technical Context

## Technologies Used

- **Nuxt.js**: Vue.js framework with server-side rendering
- **TypeScript**: Type-safe JavaScript
- **Sanity**: Headless CMS for content management
- **Drizzle ORM**: Type-safe database ORM
- **Sentry**: Error tracking and performance monitoring
- **Tailwind CSS**: Utility-first CSS framework
- **Pinia**: State management
- **Vue I18n**: Internationalization

## Database

- Uses Drizzle ORM for database operations
- Database queries are consistently wrapped with Sentry spans for observability
- All database operations include proper error handling

## API Structure

- Server API routes located in `server/api/` directory
- Consistent error handling across all endpoints
- User authentication where required
- Database queries wrapped with Sentry spans

## State Management

- Pinia stores for centralized state
- User store handles profile updates and authentication
- Sentry user context is set when updating user information

## Error Tracking

- Sentry integration for comprehensive error tracking
- User context included in error reports
- Performance monitoring for database operations
