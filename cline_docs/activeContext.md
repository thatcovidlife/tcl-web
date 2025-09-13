# Active Context

## What We're Working On Now

We have simplified the database schema by removing all tables except for `users` and `profiles`. Now we need to update or remove all API routes that were using the deleted tables.

## Recent Changes

- Simplified the database schema by removing all tables except for `users` and `profiles`
- Generated a new migration file to drop the deleted tables
- Updated the bio column in the profiles table to have a maximum length of 500 characters

## Next Steps

- Update or remove all API routes that were using the deleted tables (posts, comments, reviews, categories)
- Test the database integration thoroughly
- Clean up any remaining references to the deleted tables in the codebase
