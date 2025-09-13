# Progress

## What Works

- Authentication
- Home page
- List pages
- Contribute form with Resend integration
- Search
- Articles pages
- Database schema simplified to only include users and profiles tables
- Database migration from Prisma to Drizzle (complete)
- Composable refactoring from `usePrisma` to `useApiRoutes` (complete)

## What's Left to Build

- Additional Filters
- Support page
- Mobile marketing page
- User account page
- Protecting directory from unauthenticated access
- Update or remove API routes that were using the deleted tables (posts, comments, reviews, categories)

## Progress Status

The database schema has been simplified to only include users and profiles tables. A migration has been generated to drop the deleted tables. The next step is to update or remove all API routes that were using the deleted tables.
