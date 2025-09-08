# Technical Context

## Technologies Used

- Nuxt.js / Vue.js for the UI
- Tailwind CSS and ShadCN component library
- Pinia
- TypeScript
- Vitest
- Sanity CMS
- Drizzle ORM
- PostgreSQL
- IFFFT
- Auth0
- CircleCI
- Vercel
- Cloudflare
- Umami

## Development Setup

This is a set of Node.js-based microservices.

## Technical Constraints

Unit testing, PR gates, code formatting and linting are required.

## Database Migration

The project has been migrated from Prisma ORM to Drizzle ORM. Key changes include:

- Replaced Prisma with Drizzle ORM for database operations
- Updated schema definitions in `lib/db/schema/index.ts`
- Modified database connection in `lib/db/index.ts` to use `DZL_DATABASE_URL` environment variable
- Added Drizzle configuration in `drizzle.config.ts`
- Generated new migration files in `lib/db/migrations`
