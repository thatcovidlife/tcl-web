# Active Context

## What We're Working On Now

We have successfully migrated most of the Prisma ORM to Drizzle ORM in this Nuxt.js project. The main components of the migration have been completed, but there are still a few API routes that need to be converted.

## Recent Changes

- Replaced Prisma with Drizzle ORM for database operations
- Converted Prisma schema to Drizzle schema in `lib/db/schema/index.ts`
- Updated database connection code in `lib/db/index.ts` to use the correct environment variable (DZL_DATABASE_URL)
- Generated database migration files
- Converted most API routes from Prisma to Drizzle syntax
- Fixed the UUID generation issue in the reviews table

## Next Steps

- Test the database integration thoroughly
- Clean up any remaining Prisma-specific files and dependencies
