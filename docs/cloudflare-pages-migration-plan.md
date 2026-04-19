# Cloudflare Pages Migration Plan

## Overview

Migrate **That Covid Life** (Nuxt 3.19.1, Nitro) from Vercel to Cloudflare Pages. The app uses SSR, 28 API endpoints, PostgreSQL (Neon), Upstash Redis, Qdrant vector DB, DeepInfra LLM, Auth0 OAuth, and several third-party services.

**Estimated effort:** 3-5 days

---

## Phase 0: Prerequisites & Research

- [ ] Create a Cloudflare Pages project (linked to the Git repo)
- [ ] Provision a Cloudflare paid plan (Workers Paid) for 30s CPU timeout and Hyperdrive access
- [ ] Set up Cloudflare Pages environment variables (see [Environment Variables](#environment-variables))
- [ ] Verify `nitro` preset `cloudflare-pages` compatibility with Nuxt 3.19.1
- [ ] Test a minimal Nuxt 3 + Nitro + Cloudflare Pages deployment to validate the toolchain

---

## Phase 1: Configuration Changes

### 1.1 Nitro Preset

**File:** `nuxt.config.ts`

```ts
// Add to nitro config:
nitro: {
  preset: 'cloudflare-pages',
  // ...existing routeRules
}
```

### 1.2 Install Cloudflare Dependencies

```bash
yarn add -D wrangler @cloudflare/workers-types
```

### 1.3 Create `wrangler.toml`

Create a `wrangler.toml` at the project root for local development and configuration:

```toml
name = "tcl-web"
compatibility_date = "2024-11-01"
compatibility_flags = ["nodejs_compat"]

[placement]
mode = "smart"
```

The `nodejs_compat` flag enables partial Node.js API polyfills in Workers (Buffer, process, EventEmitter, etc.).

### 1.4 Migrate `vercel.json` Redirect

**File:** Delete `vercel.json`

Create `public/_redirects` for Cloudflare Pages:

```
https://covid-conscious.vercel.app/* https://thatcovid.life/:splat 301
```

Or configure the redirect in the Cloudflare dashboard under Page Rules / Redirect Rules.

### 1.5 TypeScript Config

**File:** `tsconfig.json`

Add Cloudflare Workers types if needed:

```json
{
  "compilerOptions": {
    "types": ["@cloudflare/workers-types"]
  }
}
```

---

## Phase 2: Critical Blockers (Must Fix)

### 2.1 PostgreSQL Driver — Replace `postgres` with Neon Serverless

**Problem:** `postgres` (postgres-js) uses TCP sockets, unavailable in Workers.

**Solution:** Use `@neondatabase/serverless` with Drizzle's `neon-http` adapter.

**Files to change:**
- `lib/db/index.ts` — replace driver
- `package.json` — swap packages

**Steps:**

1. Install the Neon serverless driver:
   ```bash
   yarn add @neondatabase/serverless
   yarn remove postgres pg
   ```

2. Rewrite `lib/db/index.ts`:
   ```ts
   // Before:
   import postgres from 'postgres'
   import { drizzle } from 'drizzle-orm/postgres-js'
   const client = postgres(connectionString, { prepare: false })
   export const db = drizzle(client, { schema })

   // After:
   import { neon } from '@neondatabase/serverless'
   import { drizzle } from 'drizzle-orm/neon-http'
   const sql = neon(connectionString)
   export const db = drizzle(sql, { schema })
   ```

3. Verify all Drizzle queries work with `neon-http` adapter (it has some limitations with transactions and prepared statements).

4. Test all 18 API endpoints that use the database.

**Alternative:** Use Cloudflare Hyperdrive (TCP proxy for existing `postgres` driver). This requires less code change but adds a Cloudflare-specific service dependency:
```bash
yarn add @cloudflare/hyperdrive
```

### 2.2 Remove Node.js `req`/`res` Usage

**Problem:** Three files access `event.node.req` / `event.node.res` directly, which are Node.js `IncomingMessage`/`ServerResponse` objects.

**File: `server/plugins/block.ts`**

Rewrite to use Nitro portable helpers:
```ts
// Before:
const { req, res } = event.node
const userAgent = req.headers['user-agent']
res.statusCode = 403
res.setHeader('Content-Type', 'text/plain')
res.end('Forbidden')

// After:
const userAgent = getHeader(event, 'user-agent')
setResponseStatus(event, 403)
setHeader(event, 'Content-Type', 'text/plain')
return 'Forbidden'
```

**File: `server/api/chat/index.post.ts`** (line ~36)

```ts
// Before:
event.node.req.headers['x-skip-xss-validator'] = 'true'

// After:
setHeader(event, 'x-skip-xss-validator', 'true')
```

**File: `server/middleware/block-bots.ts`** (line ~25)

```ts
// Before:
event.node.req.url

// After:
event.path
```

### 2.3 Remove Vercel-Specific Exports

**File: `server/api/chat/index.post.ts`**

Remove `maxDuration = 300` — this is a Vercel-specific function config that has no effect on Cloudflare.

### 2.4 Open Graph Scraper Compatibility

**Problem:** `open-graph-scraper` likely uses Node.js-specific HTML parsing.

**File:** `server/api/external/feeds/blog/og.post.ts`

**Options (choose one):**

1. **Replace with `fetch()` + regex** — lightweight OG tag extraction:
   ```ts
   const html = await $fetch<string>(url)
   // Extract og: tags with regex
   const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/)?.[1]
   ```

2. **Use Cloudflare Browser Rendering** (Workers AI + Puppeteer) for full scraping.

3. **Drop the endpoint** if it's not critical (it appears to be a debug/internal tool based on `test-opengraph.get.ts`).

### 2.5 Pangea AI Guard SDK

**Problem:** `pangea-node-sdk` is Node.js-only. Currently disabled in `.env` (`PANGEA_ENABLED` is commented out).

**File:** `lib/chat/guard.ts`

**Solution:** Since Pangea is already disabled, either:
1. Remove the Pangea dependency entirely (the LLM-based fallback `aiGuardCheckLlm` already works)
2. Or call Pangea's REST API directly with `fetch()` if re-enabling

```bash
yarn remove pangea-node-sdk
```

---

## Phase 3: Likely Needs Work (Verify & Fix)

### 3.1 LangSmith SDK

**File:** `lib/chat/prompt.ts`

The `langsmith` SDK may use Node.js networking. Options:
1. Test if it works with `nodejs_compat` flag
2. Replace with direct HTTP calls to LangSmith API using `fetch()`
3. Embed the prompt as a static string (the fallback already does this)

### 3.2 DeepL SDK

**File:** `server/api/translate.post.ts`

The `deepl-node` package may use Node.js `http` module. Options:
1. Test with `nodejs_compat` flag
2. Replace with direct DeepL REST API call:
   ```ts
   const response = await $fetch(`https://api-free.deepl.com/v2/translate`, {
     method: 'POST',
     body: { text: [text], target_lang: targetLang, auth_key: apiKey },
   })
   ```

### 3.3 Qdrant Client

**File:** `lib/chat/embedding.ts`

The `@qdrant/js-client-rest` package uses HTTP/REST but may have Node.js dependencies. Options:
1. Test if it works as-is with `nodejs_compat`
2. Replace with direct `fetch()` calls to Qdrant's REST API (the endpoints are well-documented)

### 3.4 Chat Streaming Timeout

**File:** `server/api/chat/index.post.ts`

The current 290-second timeout exceeds Workers free tier (10s CPU) and paid tier (30s CPU). Options:
1. **Workers Paid plan** — 30s CPU limit with streaming responses (wall clock can be longer since I/O doesn't count toward CPU time). Streaming SSE keeps the connection alive.
2. **Durable Objects** — For extended execution, use Cloudflare Durable Objects with `unstable_noWallClockLimit` for up to 15 minutes.
3. **Reduce timeout** — Set a more conservative timeout (e.g., 25s) if LLM responses can be constrained.

### 3.5 Sentry Edge Compatibility

**File:** `nuxt.config.ts` (Sentry config)

Verify `@sentry/nuxt` edge runtime support. Sentry does have a Cloudflare Workers integration (`@sentry/cloudflare`). May need to adjust the `autoInjectServerSentry` configuration.

---

## Phase 4: Minor Adjustments

### 4.1 `process.env` Reads at Module Scope

**Files:** `lib/chat/config.ts`, `lib/db/index.ts`

Module-level `process.env` reads work on Cloudflare Pages because Nuxt/Nitro injects them at build time. However, if any secrets are meant to be runtime-only (not bundled), move them to `useRuntimeConfig()`:

```ts
// In nuxt.config.ts runtimeConfig:
runtimeConfig: {
  deepinfraApiKey: process.env.DEEPINFRA_API_KEY,
  // ...other private keys
}
```

Then in server code:
```ts
const config = useRuntimeConfig(event)
const apiKey = config.deepinfraApiKey
```

### 4.2 In-Memory State

**File:** `server/api/crawler-stats.get.ts`

The module-scoped `Map()` won't persist across Worker isolates. Options:
1. Accept ephemeral behavior (stats reset per isolate)
2. Use Cloudflare KV or D1 for persistent crawler stats
3. Remove the endpoint if it's only used for debugging

### 4.3 Auth0 Session Storage

`nuxt-auth-utils` uses encrypted cookies for sessions. Verify that session encryption works in the Workers runtime (it should, since it uses Web Crypto API). Test the full OAuth flow end-to-end.

---

## Phase 5: Build & Deploy

### 5.1 Build Configuration

Cloudflare Pages build settings:
- **Build command:** `yarn build`
- **Build output directory:** `.output/public`
- **Node.js version:** `22` (set in environment variables)

### 5.2 Environment Variables

Set all variables in Cloudflare Pages dashboard (Settings → Environment variables):

| Variable | Environment | Notes |
|---|---|---|
| `SANITY_DATASET` | Production: `"production"` | Change from `"development"` |
| `SANITY_PROJECTID` | All | `yt0dcu6v` |
| `SANITY_TOKEN` | Production | Use production token |
| `TURNSTILE_SECRET_KEY` | All | Already Cloudflare-native |
| `TURNSTILE_SITE_KEY` | All | Already Cloudflare-native |
| `NUXT_PUBLIC_SITE_URL` | All | `https://thatcovid.life` |
| `NUXT_SESSION_PASSWORD` | Production | Use production secret |
| `NUXT_OAUTH_AUTH0_CLIENT_ID` | Production | Use production client ID |
| `NUXT_OAUTH_AUTH0_CLIENT_SECRET` | Production | Use production secret |
| `NUXT_OAUTH_AUTH0_DOMAIN` | Production | `auth.thatcovid.life` |
| `STATSIG_CLIENT_ID` | Production | Use production client ID |
| `QDRANT_URL` | All | `https://qdrant.thatcovid.life` |
| `QDRANT_PORT` | All | `443` |
| `QDRANT_KEY` | All | Production API key |
| `DEEPINFRA_API_KEY` | All | API key |
| `DEEPINFRA_BASE_URL` | All | `https://api.deepinfra.com` |
| `DEEPINFRA_EMBED_MODEL` | All | `Qwen/Qwen3-Embedding-4B` |
| `DEEPINFRA_LLM_TEMPERATURE` | All | `0.5` |
| `DEEPINFRA_LLM_MAX_TOKENS` | All | `16384` |
| `DEEPINFRA_MAX_RESULTS` | All | `15` |
| `UPSTASH_REDIS_REST_URL` | All | Upstash URL |
| `UPSTASH_REDIS_REST_TOKEN` | All | Upstash token |
| `RATE_LIMIT_WINDOW` | All | `3600 s` |
| `RATE_LIMIT_MAX_REQUESTS` | All | `50` |
| `RATE_LIMIT_PREFIX` | All | `tcl/ratelimit` |
| `LANGCHAIN_API_KEY` | All | LangSmith key |
| `LANGCHAIN_ENDPOINT` | All | `https://api.smith.langchain.com` |
| `LANGSMITH_PROMPT_NAME` | All | `tcl-chatbot-stg` (rename for prod) |
| `RERANK_ENABLED` | All | `true` |
| `RERANK_TOP_N` | All | `5` |
| `RERANK_MODEL` | All | `Qwen/Qwen3-Reranker-4B` |
| `RESEND_API_KEY` | All | Resend key |
| `RESEND_RECIPIENT_EMAIL_1` | All | `covidconsciousproject@gmail.com` |
| `RESEND_RECIPIENT_EMAIL_2` | All | `pakixicanita@gmail.com` |
| `RESEND_SUPPORT_EMAIL` | All | `contact@thatcovid.life` |
| `DZL_DATABASE_URL` | Production | Production Neon connection string |
| `AGENTIC_ENABLED` | All | `true` |
| `AGENTIC_MAX_ITERATIONS` | All | `5` |
| `AGENTIC_MIN_SCORE_THRESHOLD` | All | `0.3` |
| `PDF_EXPORT_URL` | All | `https://tcl-pdf-export.vercel.app` |
| `DEEPL_API_KEY` | All | DeepL API key (if translate endpoint is used) |

### 5.3 Custom Domain

1. Add `thatcovid.life` as a custom domain in Cloudflare Pages
2. Update DNS records to point to Cloudflare
3. Enable Cloudflare SSL/TLS (Full Strict mode)

### 5.4 `_headers` File

Create `public/_headers` for security headers (replacing Vercel's header handling):

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/api/chat
  X-Robots-Tag: noindex
```

---

## Phase 6: Testing & Validation

### 6.1 Local Testing

```bash
# Build with Cloudflare preset
yarn build

# Preview with Wrangler (simulates Workers runtime)
npx wrangler pages dev .output/public
```

### 6.2 Test Matrix

| Area | Test Cases | Priority |
|---|---|---|
| **Auth** | Auth0 login/logout, session persistence, protected routes | Critical |
| **Chat** | Streaming responses, rate limiting, message save/load | Critical |
| **Chat RAG** | Vector search, reranking, agentic mode | Critical |
| **Database** | All CRUD operations across 18 endpoints | Critical |
| **Email** | Contact form, support form via Resend | High |
| **CMS** | Sanity content rendering, i18n, sitemap | High |
| **Translation** | DeepL translate endpoint | Medium |
| **Feeds** | RSS feed, YouTube feed proxy | Medium |
| **Bot Protection** | Cloudflare Turnstile, bot blocking middleware | High |
| **Performance** | Cold start time, streaming latency, TTFB | High |
| **SEO** | OG tags, sitemap, crawlers, `_redirects` | High |
| **PWA** | Service worker registration, offline support | Low |

### 6.3 Monitoring

1. Set up Cloudflare Web Analytics (replaces Vercel Analytics)
2. Verify Sentry error reporting works in Workers runtime
3. Monitor Workers CPU time and request metrics in Cloudflare dashboard

---

## Phase 7: Cutover

1. Deploy to Cloudflare Pages (production branch)
2. Test production URL before switching DNS
3. Update DNS to point `thatcovid.life` to Cloudflare Pages
4. Monitor for 24-48 hours before decommissioning Vercel
5. Remove `vercel.json`, `@vercel/nft` resolution, and Vercel-specific code
6. Update Auth0 callback URLs if needed
7. Decommission Vercel project

---

## Risk Assessment

| Risk | Impact | Mitigation |
|---|---|---|
| Neon HTTP driver query incompatibility | High | Test all Drizzle queries; use Hyperdrive as fallback |
| Chat streaming timeout on Workers | High | Use Workers paid plan; implement Durable Objects if needed |
| `nodejs_compat` gaps for npm packages | Medium | Test each package; replace with `fetch()` calls where needed |
| Cold start latency | Medium | Workers have ~0ms cold starts; Neon HTTP may add latency |
| Session encryption differences | Low | Web Crypto API is standard; test auth flow thoroughly |

---

## Compatible Services (No Changes Needed)

- Upstash Redis / Rate Limiting (HTTP-based)
- Resend email (HTTP-based)
- Cloudflare Turnstile (already Cloudflare-native)
- Sanity CMS (HTTP API)
- Vercel AI SDK (edge-compatible)
- `crypto.randomUUID()` (Web Crypto API)
- `nanoid`, `lodash` (pure JS)
- Statsig (client-side SDK)
