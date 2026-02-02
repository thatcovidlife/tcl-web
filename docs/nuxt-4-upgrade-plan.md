# Nuxt 4.3 Upgrade Plan

> **Project**: That Covid Life (tcl-web)
> **Current Version**: Nuxt 3.19.1
> **Target Version**: Nuxt 4.3
> **Date**: 2026-02-01
> **Deployment**: Vercel
> **Priority**: ASAP

## Executive Summary

This document outlines the migration strategy for upgrading the That Covid Life application from Nuxt 3.19.1 to Nuxt 4.3. The upgrade includes **adopting the new `app/` directory structure** during the migration, which provides performance and type-safety benefits.

**Key Decision**: Adopting the new Nuxt 4 default directory structure during the upgrade (not phased).

**Nuxt 3 End-of-Life**: January 31, 2026 - making this upgrade critical for continued security support.

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Breaking Changes & Impact Assessment](#breaking-changes--impact-assessment)
3. [Pre-Upgrade Checklist](#pre-upgrade-checklist)
4. [Migration Steps](#migration-steps)
5. [Module Compatibility](#module-compatibility)
6. [Testing Strategy](#testing-strategy)
7. [Rollback Plan](#rollback-plan)

---

## Current State Analysis

### Dependencies Overview

| Package | Current Version | Target Action |
|---------|----------------|---------------|
| `nuxt` | 3.19.1 | Upgrade to ^4.3.0 |
| `vue` | 3.5.21 | Keep (compatible) |
| `@nuxt/kit` | ^3.19.1 (resolution) | Upgrade to ^4.3.0 |
| `typescript` | ^5.9.3 | Keep (compatible) |

### Current Directory Structure (Before Migration)

```
tcl-web/
├── assets/          # Styles, constants, utils
├── components/      # Vue components
├── composables/     # Vue composition functions
├── layouts/         # Nuxt layouts
├── middleware/      # Global middleware
├── pages/           # File-based routing
├── plugins/         # Nuxt plugins
├── server/          # Nitro server routes
├── store/           # Pinia stores
├── sanity/          # Sanity CMS integration
├── lib/             # Utilities (chat, db, utils)
├── public/          # Static assets
├── nuxt.config.ts   # Nuxt configuration
└── tsconfig.json    # TypeScript configuration
```

### Target Directory Structure (After Migration)

```
tcl-web/
├── app/                    # NEW: Main source directory
│   ├── assets/             # Styles, constants, utils (moved)
│   ├── components/         # Vue components (moved)
│   ├── composables/        # Vue composition functions (moved)
│   ├── layouts/            # Nuxt layouts (moved)
│   ├── middleware/         # Global middleware (moved)
│   ├── pages/              # File-based routing (moved)
│   ├── plugins/            # Nuxt plugins (moved)
│   ├── utils/              # NEW: Utilities from lib/utils
│   ├── app.vue             # Root component (if exists, moved)
│   ├── app.config.ts       # App config (if exists, moved)
│   └── error.vue           # Error page (if exists, moved)
├── server/                 # Nitro server routes (stays in root)
│   ├── api/
│   ├── middleware/
│   ├── plugins/
│   ├── routes/
│   └── utils/
├── lib/                    # Utilities (partially moved to app/utils)
│   ├── chat/               # Stays (server-side utilities)
│   └── db/                 # Stays (database schema)
├── store/                  # Pinia stores (stays in root or move to app/)
├── sanity/                 # Sanity CMS integration (stays in root)
├── content/                # Nuxt Content (if used, stays in root)
├── layers/                 # Nuxt layers (if any, stays in root)
├── modules/                # Custom modules (if any, stays in root)
├── public/                 # Static assets (stays in root)
├── nuxt.config.ts          # Nuxt configuration (stays in root)
├── tsconfig.json           # TypeScript configuration (stays in root)
└── package.json            # Dependencies (stays in root)
```

### Configuration Analysis

**Key Configuration Details:**
- Custom `srcDir` is **NOT** explicitly set (defaults to root) — will adopt `app/` structure
- Multiple modules: `@nuxtjs/i18n`, `@nuxtjs/sanity`, `@nuxtjs/seo`, `@nuxt/security`, etc.
- Pinia stores in `./store/**` (will remain in root or can move to `app/`)
- Tailwind CSS configured
- Sentry integration
- PWA enabled via `@vite-pwa/nuxt`
- **Deployment**: Vercel (no Nuxt-specific CI commands)

---

## Breaking Changes & Impact Assessment

### 1. New Directory Structure (Impact: SIGNIFICANT)

**Change**: Nuxt 4 defaults `srcDir` to `app/` directory.

**Current State**: This project uses root-level structure (no custom `srcDir`).

**Migration Decision**: ✅ **Adopting the new `app/` structure during upgrade**

**Benefits**:
- **Performance**: Faster startup times (reduced FS scanning on non-Mac OS)
- **Type-Safety**: Better separation of server and app contexts for IDE IntelliSense
- **Best Practice**: Aligns with Nuxt 4 defaults and future patterns

**Directories to Move to `app/`**:
- `assets/` → `app/assets/`
- `components/` → `app/components/`
- `composables/` → `app/composables/`
- `layouts/` → `app/layouts/`
- `middleware/` → `app/middleware/`
- `pages/` → `app/pages/`
- `plugins/` → `app/plugins/`
- `lib/utils/` → `app/utils/` (shared utilities only)
- `app.vue` (if exists) → `app/app.vue`
- `error.vue` (if exists) → `app/error.vue`
- `app.config.ts` (if exists) → `app/app.config.ts`

**Directories Staying in Root**:
- `server/` - Nitro server routes (now resolved from root)
- `public/` - Static assets
- `lib/chat/` - Server-side chat utilities
- `lib/db/` - Database schema
- `store/` - Pinia stores (can also move to `app/`)
- `sanity/` - Sanity CMS integration
- `nuxt.config.ts` - Configuration
- `tsconfig.json` - TypeScript config

**Note**: After migration, the `~` alias will point to `app/` instead of root. Update any path references accordingly.

### 2. Singleton Data Fetching Layer (Impact: MODERATE)

**Changes**:
- Shared refs for same keys across `useAsyncData`/`useFetch`
- `getCachedData` receives context with cause information
- Data cleanup on component unmount
- `data` and `error` now default to `undefined` instead of `null`

**Files to Review**:
- [pages/index.vue](pages/index.vue) - Uses Sentry.startSpan with data fetching
- All pages using `useAsyncData` or `useFetch`

**Action Required**:
1. Audit all `useAsyncData`/`useFetch` calls for duplicate keys with conflicting options
2. Update any `null` checks to `undefined` checks
3. Review `getCachedData` implementations if present

### 3. Shallow Data Reactivity (Impact: MINIMAL to MODERATE)

**Change**: `data` from `useAsyncData`/`useFetch` is now `shallowRef` by default.

**Current Usage**: The project uses data fetching across multiple pages.

**Action Required**:
- Add `{ deep: true }` to any composables that modify data properties reactively
- Or globally enable with `experimental.defaults.useAsyncData.deep: true`

### 4. TypeScript Configuration Splitting (Impact: MINIMAL)

**Change**: Separate TypeScript configs for app, server, and node contexts.

**Current State**: Extends `.nuxt/tsconfig.json` from root.

**Migration**:
```json
// tsconfig.json - Opt-in to project references
{
  "files": [],
  "references": [
    { "path": "./.nuxt/tsconfig.app.json" },
    { "path": "./.nuxt/tsconfig.server.json" },
    { "path": "./.nuxt/tsconfig.shared.json" },
    { "path": "./.nuxt/tsconfig.node.json" }
  ]
}
```

### 5. Unhead v2 (Impact: MINIMAL)

**Removed Props**: `vmid`, `hid`, `children`, `body`

**Action**: Review any manual `useHead()` calls for these deprecated props.

### 6. Route Metadata Deduplication (Impact: MINIMAL)

**Change**: Route metadata like `name`, `path` are only on `route` object, not `route.meta`.

**Files to Check**: Any code accessing `route.meta.name` or similar.

### 7. `compatibilityDate` Update (Impact: MINIMAL)

**Current**: `2024-11-01`
**Required**: Update to at least `2024-12-01` for Nuxt 4

### 8. Removal of Top-Level `generate` Config (Impact: NONE)

**Status**: Not used in current config. No action needed.

---

## Pre-Upgrade Checklist

- [ ] Create a new branch for the upgrade: `feature/nuxt-4-upgrade`
- [ ] Run full test suite: `yarn test:ci`
- [ ] Create database backup (if testing with production data)
- [ ] Document any environment-specific configurations
- [ ] Check for deprecated API usage in custom modules/plugins
- [ ] Review all third-party modules for Nuxt 4 compatibility

---

## Migration Steps

### Phase 1: Dependency Upgrade (Estimated: 30 minutes)

1. **Update Nuxt core dependencies**:
```bash
yarn add nuxt@^4.3.0
yarn add -D @nuxt/kit@^4.3.0
```

2. **Update resolutions in package.json**:
```json
"resolutions": {
  "@nuxt/kit": "^4.3.0",
  "@vercel/nft": "^0.27.4"
}
```

3. **Update compatibilityDate in nuxt.config.ts**:
```ts
compatibilityDate: '2024-12-01'
```

4. **Clean install**:
```bash
rm -rf node_modules .nuxt
yarn install --immutable
yarn prepare
```

### Phase 2: Directory Structure Migration (Estimated: 1-2 hours)

**DECISION**: Adopting the new `app/` directory structure during upgrade.

1. **Run the file structure codemod** (automated approach):
```bash
npx codemod@latest nuxt/4/file-structure
```

The codemod will:
- Create the `app/` directory
- Move applicable directories into `app/`
- Update path imports where possible

2. **OR manually migrate** (if codemod fails or for more control):

```bash
# Create app directory
mkdir -p app

# Move directories
mv assets app/
mv components app/
mv composables app/
mv layouts app/
mv middleware app/
mv pages app/
mv plugins app/

# Move shared utilities (keep server-specific utils in lib/)
mkdir -p app/utils
mv lib/utils/* app/utils/ 2>/dev/null || true

# Move root files if they exist
mv app.vue app/ 2>/dev/null || true
mv error.vue app/ 2>/dev/null || true
mv app.config.ts app/ 2>/dev/null || true
```

3. **Verify structure**:
```bash
# Should show:
# app/
# app/assets/
# app/components/
# app/composables/
# app/layouts/
# app/middleware/
# app/pages/
# app/plugins/
# app/utils/
# server/ (still in root)
# public/ (still in root)
# nuxt.config.ts (still in root)
```

4. **Update path references** (if any hardcoded paths exist):
- `~/components` → still works (now resolves to `app/components/`)
- `~/pages` → still works (now resolves to `app/pages/`)
- Any absolute imports using `@/` may need verification

### Phase 3: Configuration Updates (Estimated: 30 minutes)

1. **Update compatibilityDate in nuxt.config.ts**:
```ts
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-12-01',
  // No srcDir needed - will auto-detect app/ directory
  // ... rest of config
})
```

2. **Opt-in to new TypeScript project references** (recommended):
```json
// tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./.nuxt/tsconfig.app.json" },
    { "path": "./.nuxt/tsconfig.server.json" },
    { "path": "./.nuxt/tsconfig.shared.json" },
    { "path": "./.nuxt/tsconfig.node.json" }
  ],
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    },
    "typeRoots": ["./node_modules", "./node_modules/@types"]
  }
}
```

3. **Update typecheck script** (add to package.json if not exists):
```json
// package.json
"typecheck": "nuxt prepare && vue-tsc -b --noEmit"
```

4. **Regenerate Nuxt types**:
```bash
nuxt prepare
```

### Phase 4: Code Migration (Estimated: 1-2 hours)

1. **Run remaining codemods** (file structure already done in Phase 2):
```bash
# Run all remaining migration codemods
npx codemod@latest nuxt/4/default-data-error-value
npx codemod@latest nuxt/4/deprecated-dedupe-value
npx codemod@latest nuxt/4/shallow-function-reactivity
npx codemod@latest nuxt/4/absolute-watch-path
npx codemod@latest nuxt/4/template-compilation-changes
```

Or run the full recipe (it will skip file-structure if already done):
```bash
npx codemod@latest nuxt/4/migration-recipe
```

2. **Manual review and fixes**:
   - Search for `useAsyncData` and `useFetch` calls
   - Check for inconsistent options with same keys
   - Update `null` checks to `undefined`
   - Review any `getCachedData` implementations

### Phase 5: Module Updates (Estimated: 30-60 minutes)

Update modules to Nuxt 4 compatible versions:

| Module | Current | Target | Notes |
|--------|---------|--------|-------|
| `@nuxtjs/i18n` | 9.3.0 | ^9.4.0+ | Check v9 compatibility |
| `@nuxtjs/sanity` | ^1.13.3 | Check latest | Verify Nuxt 4 support |
| `@nuxtjs/seo` | ^3.1.0 | Check latest | Verify Nuxt 4 support |
| `@nuxt/security` | ^2.4.0 | Check latest | Verify Nuxt 4 support |
| `@pinia/nuxt` | 0.11.2 | Check latest | Should be compatible |
| `@sentry/nuxt` | ^10.27.0 | Check latest | Verify Nuxt 4 support |
| `nuxt-auth-utils` | ^0.5.25 | Check latest | Verify Nuxt 4 support |
| `@vite-pwa/nuxt` | ^1.1.0 | Check latest | Verify Nuxt 4 support |
| `@nuxtjs/tailwindcss` | ^6.14.0 | Check latest | Should be compatible |

**Approach**: Test and fix module issues as they arise during development.

### Phase 6: Testing & Validation (Estimated: 2-3 hours)

1. **Start development server**:
```bash
yarn dev
```

2. **Run type checking**:
```bash
# If using project references
yarn typecheck

# Or traditional
nuxt prepare && vue-tsc --noEmit
```

3. **Run test suite**:
```bash
yarn test:ci
```

4. **Manual testing checklist**:
   - [ ] Homepage loads correctly
   - [ ] Navigation between pages works
   - [ ] Chat functionality (AI features)
   - [ ] User authentication flow
   - [ ] Internationalization (i18n) language switching
   - [ ] PWA installation/behavior
   - [ ] Dark mode toggle
   - [ ] All API endpoints respond correctly
   - [ ] Sentry error reporting

5. **Build verification**:
```bash
yarn build
yarn preview
```

### Phase 7: Production Deployment (Vercel)

1. **Vercel-specific checks**:
   - No Nuxt-specific commands in CircleCI pipeline (confirmed)
   - Build command: `yarn build` (standard)
   - Output directory: `.output/public` (Nuxt 4 default)

2. **Test deployment** on Vercel preview before merging to main

3. **Monitor** Vercel build logs for any warnings or errors

---

## Module Compatibility

### Known Compatibility Status

| Module | Status | Notes |
|--------|--------|-------|
| `@formkit/auto-animate/nuxt` | ⚠️ Verify | Check for Nuxt 4 support |
| `@nuxt/icon` | ✅ Likely | Official Nuxt module |
| `@nuxt/image` | ✅ Likely | Official Nuxt module |
| `@nuxtjs/color-mode` | ⚠️ Verify | Check GitHub for updates |
| `@nuxtjs/i18n` | ⚠️ Verify | Major module, check v9/v10 |
| `@nuxtjs/leaflet` | ⚠️ Verify | Community module |
| `@nuxtjs/sanity` | ⚠️ Verify | Check for Nuxt 4 support |
| `@nuxtjs/seo` | ⚠️ Verify | Check for Nuxt 4 support |
| `@nuxtjs/tailwindcss` | ✅ Likely | Official module, v6+ |
| `@nuxtjs/turnstile` | ⚠️ Verify | Check for Nuxt 4 support |
| `@pinia/nuxt` | ✅ Likely | Pinia has good Vue 3 support |
| `@vite-pwa/nuxt` | ⚠️ Verify | Check for Nuxt 4 support |
| `@vueuse/nuxt` | ✅ Likely | Framework-agnostic |
| `motion-v/nuxt` | ⚠️ Verify | Motion library |
| `nuxt-auth-utils` | ⚠️ Verify | Check for Nuxt 4 support |
| `nuxt-llms` | ⚠️ Verify | Check for Nuxt 4 support |
| `nuxt-security` | ⚠️ Verify | Check for Nuxt 4 support |
| `shadcn-nuxt` | ⚠️ Verify | Check for Nuxt 4 support |
| `@sentry/nuxt/module` | ⚠️ Verify | Check for Nuxt 4 support |

### Action: Run this command after Nuxt upgrade to identify issues:

```bash
npx nuxi-upgrade-modules
```

Or manually check each module's repository for Nuxt 4 compatibility.

---

## Testing Strategy

### Unit Tests

- Run existing Vitest suite: `yarn test:ci`
- Pay attention to:
  - Component tests using `@vue/test-utils` (component name changes)
  - Tests that mock `useAsyncData`/`useFetch`

### Integration Tests

- Test API endpoints in `server/api/`
- Verify chat endpoints with AI integration
- Test authentication flow
- Verify database operations

### E2E Testing Checklist

| Feature | Test Cases | Priority |
|---------|-----------|----------|
| Navigation | Page transitions, route params | High |
| i18n | Language switching, locale routing | High |
| Chat | Message sending, streaming response | High |
| Auth | Login, logout, protected routes | High |
| Search | Content search, filters | Medium |
| PWA | Install prompt, offline behavior | Medium |
| Dark Mode | Theme toggle, persistence | Low |

### Performance Testing

After upgrade, verify:
- Build time is similar or better
- Initial page load performance
- Time to Interactive (TTI)
- Bundle size comparison

---

## Rollback Plan

If critical issues arise:

1. **Revert dependencies** in `package.json`:
```json
"nuxt": "^3.19.1",
"@nuxt/kit": "^3.19.1"
```

2. **Reinstall**:
```bash
rm -rf node_modules .nuxt
yarn install --immutable
```

3. **Revert code changes** from git:
```bash
git checkout <pre-upgrade-commit>
```

4. **Restore database** if modified during testing

---

## Post-Upgrade Tasks

### Immediate (After Successful Upgrade)

- [ ] Update team documentation
- [ ] Update developer onboarding guide with new `app/` structure
- [ ] Monitor Sentry for new errors
- [ ] Update CLAUDE.md with Nuxt 4 specific patterns
- [ ] Verify Vercel deployment is working correctly

### Future Improvements (Optional)

- [ ] Move `store/` to `app/store/` for consistency
- [ ] Review and optimize data fetching patterns
- [ ] Update to latest module versions as they release Nuxt 4 support
- [ ] Enable `noUncheckedIndexedAccess` TypeScript option and fix any issues

---

## Timeline Estimate

| Phase | Time Estimate | Notes |
|-------|---------------|-------|
| Phase 1: Dependency Upgrade | 30 min | Straightforward |
| Phase 2: Directory Structure Migration | 1-2 hours | Moving directories, updating paths |
| Phase 3: Configuration Updates | 30 min | TypeScript, compatibilityDate |
| Phase 4: Code Migration | 1-2 hours | Codemods + manual review |
| Phase 5: Module Updates | 30-60 min | Fix issues as they arise |
| Phase 6: Testing & Validation | 2-3 hours | Full test suite + manual testing |
| Phase 7: Production Deployment | 30 min | Vercel deployment |
| **Total** | **6 - 9 hours** | App/ structure adds ~1-2 hours |

---

## References & Resources

- [Official Nuxt 4 Upgrade Guide](https://nuxt.com/docs/getting-started/upgrade)
- [Nuxt 4 Announcement Blog Post](https://nuxt.com/blog/v4)
- [Nuxt Roadmap to v4](https://nuxt.com/blog/roadmap-v4)
- [Codemod Registry for Nuxt 4](https://codemod.com/registry)
- [Nuxt GitHub Discussions](https://github.com/nuxt/nuxt/discussions)

---

## Appendix: Quick Reference Commands

```bash
# === Phase 1: Upgrade Nuxt ===
yarn add nuxt@^4.3.0
yarn add -D @nuxt/kit@^4.3.0

# Clean install
rm -rf node_modules .nuxt
yarn install --immutable

# === Phase 2: Migrate to app/ structure ===
# Automated (recommended)
npx codemod@latest nuxt/4/file-structure

# OR manual
mkdir -p app/app/utils
mv assets components composables layouts middleware pages plugins app/
mv lib/utils/* app/utils/
mv app.vue error.vue app.config.ts app/ 2>/dev/null || true

# === Phase 3: Configuration ===
# Update nuxt.config.ts: compatibilityDate: '2024-12-01'
nuxt prepare

# === Phase 4: Run remaining codemods ===
npx codemod@latest nuxt/4/migration-recipe

# === Phase 6: Testing ===
yarn dev                    # Start dev server
yarn test:ci                # Run tests
nuxt prepare && vue-tsc -b --noEmit  # Type checking
yarn build                  # Production build
yarn preview                # Preview build
```

---

## Migration Checklist

Use this checklist to track progress during the upgrade:

### Pre-Upgrade
- [ ] Create branch `feature/nuxt-4-upgrade`
- [ ] Run `yarn test:ci` to establish baseline
- [ ] Commit any pending changes

### Phase 1: Dependencies
- [ ] Update `nuxt` to `^4.3.0`
- [ ] Update `@nuxt/kit` resolution to `^4.3.0`
- [ ] Update `compatibilityDate` to `2024-12-01`
- [ ] Run `yarn install --immutable`

### Phase 2: Directory Structure
- [ ] Run `npx codemod@latest nuxt/4/file-structure` OR manually move directories
- [ ] Verify `app/` directory contains: assets, components, composables, layouts, middleware, pages, plugins, utils
- [ ] Verify `server/`, `public/`, `nuxt.config.ts` remain in root
- [ ] Run `nuxt prepare`

### Phase 3: Configuration
- [ ] Update `tsconfig.json` with project references
- [ ] Add/update `typecheck` script in package.json

### Phase 4: Code Migration
- [ ] Run `npx codemod@latest nuxt/4/migration-recipe`
- [ ] Review codemod changes
- [ ] Fix any remaining `null` → `undefined` issues
- [ ] Add `{ deep: true }` to composables that need it

### Phase 5: Modules
- [ ] Start `yarn dev` and check for module errors
- [ ] Fix any module compatibility issues

### Phase 6: Testing
- [ ] Run `yarn test:ci`
- [ ] Manual testing: homepage, navigation, chat, auth, i18n
- [ ] Run `yarn build` and verify build success

### Phase 7: Deployment
- [ ] Deploy to Vercel preview
- [ ] Verify production build works correctly
- [ ] Monitor for errors

### Post-Upgrade
- [ ] Update documentation
- [ ] Monitor Sentry
- [ ] Merge to main branch

---

*Document prepared by Claude Code for the That Covid Life project*
