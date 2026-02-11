# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow Orchestration

### 1. Plan Mode Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately – don’t keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop

- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: “Would a staff engineer approve this?”
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask “is there a more elegant way?”
- If a fix feels hacky: “Knowing everything I know now, implement the elegant solution”
- Skip this for simple, obvious fixes – don’t over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing

- When given a bug report: just fix it. Don’t ask for hand-holding
- Point at logs, errors, failing tests – then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what’s necessary. Avoid introducing bugs.

## Project Overview

**That Covid Life** – A Nuxt 3 full-stack application curating COVID-19 resources (news, research, videos, events) with an AI-powered chatbot featuring knowledge base search via vector database.

**Stack:** Vue 3, TypeScript, Nuxt 3.19.1, Yarn 4.9.4, Node.js 22.18.0

## Common Commands

```bash
# Development
yarn install --immutable  # Install dependencies
yarn dev                  # Start dev server on localhost:3000
yarn build                # Production build
yarn preview              # Preview production build
yarn lint                 # Format code with Prettier

# Testing
yarn test                 # Run Vitest in watch mode
yarn test:ci              # Run Vitest once (CI mode)
yarn test:crawlers        # Test social crawler endpoints

# Database (Drizzle ORM + PostgreSQL)
yarn db:generate          # Generate migrations
yarn db:migrate           # Run migrations
yarn db:push              # Push schema to DB
yarn db:studio            # Open Drizzle Studio
yarn db:seed              # Seed database

# Sanity CMS
yarn sanity:gen           # Regenerate GROQ types after schema changes
```

## Architecture

### Layered Structure

```
Client (Vue/Nuxt)        → pages/, components/, composables/, layouts/
Server (Nitro)           → server/api/, server/plugins/, server/routes/
Data                     → Sanity CMS, PostgreSQL (Drizzle), Qdrant Vector DB
Utilities                → lib/utils/, lib/chat/, lib/db/
```

### Key Directories

| Directory      | Purpose                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------ |
| `components/`  | Vue components (Tcl-prefixed domain components + Shadcn UI primitives in `components/ui/`) |
| `pages/`       | Nuxt file-based routing                                                                    |
| `layouts/`     | Shell layouts (default, chatbot) wrapping content with `TclHeader`, `TclBody`, `TclFooter` |
| `composables/` | Reusable Vue composition functions                                                         |
| `lib/chat/`    | AI chat system (providers, tools, embedding, guard, rate limiting)                         |
| `lib/db/`      | Database schema and connection (Drizzle ORM + PostgreSQL)                                  |
| `lib/utils/`   | Shared utilities including input sanitization (`sanitize.ts`)                              |
| `server/api/`  | Nitro API endpoints                                                                        |
| `sanity/`      | Sanity CMS integration (queries in `.groq`, schema in `schema.json`)                       |
| `store/`       | Pinia stores (`user.ts` is the single source of truth for profile data)                    |

### AI Chat Architecture

```
pages/chat.vue → /api/chat/index.post.ts → AI SDK streamText
                                              ├─ Qdrant (vector search)
                                              ├─ DeepInfra (GPT-OSS LLM)
                                              ├─ Guard Tool (LLM-based content moderation, 5s timeout fallback)
                                              └─ Upstash Redis (rate limiting)
```

**Chat system files:** [lib/chat/providers.ts](lib/chat/providers.ts), [lib/chat/config.ts](lib/chat/config.ts), [lib/chat/tools.ts](lib/chat/tools.ts), [lib/chat/embedding.ts](lib/chat/embedding.ts), [lib/chat/guard.ts](lib/chat/guard.ts)

## Development Patterns

### Content & CMS

- Editorial data lives in Sanity via `@nuxtjs/sanity`
- GROQ queries in `sanity/queries/*.groq` return typed results from `sanity/types.ts`
- Use `composables/useGroqd.ts` to build typed GROQ queries
- Regenerate types with `yarn sanity:gen` after schema changes

### State Management

- **Auth:** Auth0 via `nuxt-auth-utils`; session established in [server/routes/auth/auth0.get.ts](server/routes/auth/auth0.get.ts)
- **User State:** [store/user.ts](store/user.ts) is the single source of truth; sets Sentry user context
- **API Calls:** Use `composables/useApiRoutes.ts` instead of ad hoc `$fetch` for `/api/user` endpoints

### Error Handling

- Wrap DB/HTTP calls with `Sentry.startSpan` (see [pages/index.vue](pages/index.vue))
- Surface failures with `captureException` (see [server/api/**sitemap**/urls.get.ts](server/api/__sitemap__/urls.get.ts))

### Protected Routes

- Auth enforced by [middleware/redirect.global.ts](middleware/redirect.global.ts)
- Add new gated routes to `assets/constants/protected-pages.ts`

### Internationalization

- 4 locales: en, es, fr, pt (see [nuxt.config.ts](nuxt.config.ts))
- Use `useI18n()`, `useLocalePath()` for routing
- Sanity queries support `?lang` parameter

### UI Components

- **Domain components:** Tcl-prefixed (TclHeader, TclConversation, TclPromptInput, etc.)
- **UI primitives:** Shadcn UI in `components/ui/` (Button, Dialog, Form, etc.)
- **Styling:** Tailwind CSS; use `lib/utils.ts` `cn()` for class merges
- **Icons:** Lucide via `@iconify/vue`

### Security

- **Bot detection:** [middleware/bots.global.ts](middleware/bots.global.ts) (client) + [server/plugins/block.ts](server/plugins/block.ts) (server)
- **Input sanitization:** [lib/utils/sanitize.ts](lib/utils/sanitize.ts) handles SQL injection, XSS, prompt injection
- **Rate limiting:** Upstash Redis sliding window on chat endpoints

## Environment Variables

Key variables for full functionality:

| Variable                                             | Purpose                   |
| ---------------------------------------------------- | ------------------------- |
| `NUXT_PUBLIC_SITE_URL`                               | Base site URL             |
| `SANITY_DATASET`, `SANITY_PROJECTID`, `SANITY_TOKEN` | Sanity CMS                |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`         | Bot protection            |
| `DZL_DATABASE_URL`                                   | PostgreSQL connection     |
| `DEEPINFRA_API_KEY`, `DEEPINFRA_BASE_URL`            | AI provider               |
| `QDRANT_URL`, `QDRANT_KEY`, `QDRANT_COLLECTION`      | Vector DB                 |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limiting             |
| `LANGSMITH_PROMPT_NAME`                              | LLM prompt management     |
| `STATSIG_CLIENT_ID`                                  | Analytics & feature flags |

## Database Schema (PostgreSQL via Drizzle)

- `user` – email, role (USER/ADMIN), active
- `profile` – user_id FK, name, bio, website, language, theme
- `chat` – user_id FK, title, created_at
- `message` – chat_id FK, content, role (user/assistant), parts (JSON)
- `like` – message_id FK, user_id FK, like (boolean)

Schema: [lib/db/schema/index.ts](lib/db/schema/index.ts)

## Automation & Quality

- **Husky:** Git hooks installed on `postinstall`
- **Commitlint:** Enforces Conventional Commits format
- **Prettier:** Formatting via `yarn lint`

## LLM Manifest

The `nuxt.config.ts` `llms` section describes site navigation for AI surfaces – extend it when adding major content areas.

## References

- [.github/copilot-instructions.md](.github/copilot-instructions.md) – Detailed patterns for Nuxt shell, Sentry integration, auth flow, API facade, external feeds, and more
