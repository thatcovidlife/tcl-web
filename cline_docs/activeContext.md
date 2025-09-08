# Active Context

## What We're Working On Now

We have successfully renamed the `usePrisma` composable to `useApiRoutes` throughout the codebase. This change reflects the migration from Prisma ORM to a more generic API handling approach. All references have been updated, including the composable file itself, store imports, and test files. TypeScript errors and test failures in the test suite have been resolved.

## Recent Changes

- Renamed `composables/usePrisma.ts` to `composables/useApiRoutes.ts`
- Updated the export name from `usePrisma` to `useApiRoutes` in the composable
- Updated the import in `store/user.ts` from `usePrisma` to `useApiRoutes`
- Renamed the test file from `tests/composables/usePrisma.nuxt.spec.ts` to `tests/composables/useApiRoutes.nuxt.spec.ts`
- Updated all references in the test file to use the new composable name
- Fixed TypeScript errors and test failures in the test file by properly mocking `$fetch` and updating test assertions

## Next Steps

- Continue with other development tasks as needed
- Ensure all parts of the application that used the old `usePrisma` composable are now using `useApiRoutes`
