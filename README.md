# That Covid Life

**That Covid Life** is a full-stack web application that curates COVID-19 resources (news, research, videos, events) with an AI-powered chatbot featuring intelligent knowledge base search via vector database.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Nuxt](https://img.shields.io/badge/Nuxt-3.19-00DC82?logo=nuxt.js)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org)

## Features

- **Content Curation**: Aggregates and displays COVID-19 related news, research papers, videos, and events
- **AI Chatbot**: Intelligent conversational interface powered by LLMs with:
  - Vector database search for knowledge base retrieval
  - Content moderation and guardrails
  - Rate limiting and abuse prevention
  - Streaming responses for real-time interaction
- **Multi-language Support**: Available in English, Spanish, French, and Portuguese
- **User Authentication**: Secure Auth0 integration with role-based access
- **Responsive Design**: Mobile-first UI built with Tailwind CSS and Shadcn components
- **Analytics**: Integrated error tracking (Sentry) and feature flags (Statsig)

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Nuxt 3.19.1, Vue 3, TypeScript |
| **Package Manager** | Yarn 4.9.4 |
| **Runtime** | Node.js 22.18.0 |
| **Database** | PostgreSQL with Drizzle ORM |
| **Vector DB** | Qdrant (for AI semantic search) |
| **CMS** | Sanity (editorial content management) |
| **AI Provider** | DeepInfra (GPT-OSS LLM) |
| **Auth** | Auth0 via nuxt-auth-utils |
| **Rate Limiting** | Upstash Redis |
| **Monitoring** | Sentry (error tracking) |
| **Styling** | Tailwind CSS, Shadcn UI, Radix Vue |
| **Testing** | Vitest |
| **Deployment** | Vercel |

## Project Structure

```
tcl-web/
├── app/                 # Nuxt app directory (pages, components, layouts)
├── components/          # Vue components (Tcl-prefixed domain + Shadcn UI primitives)
├── composables/         # Reusable Vue composition functions
├── lib/                 # Shared utilities
│   ├── chat/           # AI chat system (providers, tools, embedding, guard)
│   ├── db/             # Database schema and connection (Drizzle ORM)
│   └── utils/          # Shared utilities (sanitization, helpers)
├── pages/              # Nuxt file-based routing
├── server/             # Nitro server-side code
│   ├── api/            # API endpoints
│   ├── plugins/        # Server plugins (bot blocking, etc.)
│   └── routes/         # Server routes (auth, etc.)
├── sanity/             # Sanity CMS integration
│   ├── queries/        # GROQ queries
│   └── types.ts        # Generated TypeScript types
├── store/              # Pinia state management
├── layouts/            # Shell layouts wrapping content
└── middleware/         # Nuxt middleware (auth, bot detection)
```

## Getting Started

### Prerequisites

- Node.js 22.18.0 or higher
- Yarn 4.9.4
- PostgreSQL database
- Sanity CMS account
- Qdrant vector database instance
- Auth0 application

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tcl-web
```

2. Install dependencies:
```bash
yarn install --immutable
```

3. Configure environment variables (see [Environment Variables](#environment-variables) below)

4. Set up the database:
```bash
yarn db:push     # Push schema to database
yarn db:seed     # Seed with initial data (optional)
```

5. Start the development server:
```bash
yarn dev
```

Visit `http://localhost:3000` to see the application.

## Development Commands

```bash
# Development
yarn dev                # Start dev server on localhost:3000
yarn build              # Production build
yarn preview            # Preview production build
yarn lint               # Format code with Prettier

# Testing
yarn test               # Run Vitest in watch mode
yarn test:ci            # Run Vitest once (CI mode)
yarn test:crawlers      # Test social crawler endpoints

# Database
yarn db:generate        # Generate migrations
yarn db:migrate         # Run migrations
yarn db:push            # Push schema to DB
yarn db:studio          # Open Drizzle Studio
yarn db:seed            # Seed database

# Sanity CMS
yarn sanity:gen         # Regenerate GROQ types after schema changes
```

## Environment Variables

Create a `.env` file with the following variables:

| Variable | Purpose | Required |
|----------|---------|----------|
| `NUXT_PUBLIC_SITE_URL` | Base site URL | Yes |
| `SANITY_DATASET` | Sanity dataset name | Yes |
| `SANITY_PROJECTID` | Sanity project ID | Yes |
| `SANITY_TOKEN` | Sanity API token | Yes |
| `TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key | Yes |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret | Yes |
| `DZL_DATABASE_URL` | PostgreSQL connection string | Yes |
| `DEEPINFRA_API_KEY` | DeepInfra AI provider key | Yes |
| `DEEPINFRA_BASE_URL` | DeepInfra API base URL | Yes |
| `QDRANT_URL` | Qdrant vector DB URL | Yes |
| `QDRANT_KEY` | Qdrant API key | Yes |
| `QDRANT_COLLECTION` | Qdrant collection name | Yes |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | Yes |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | Yes |
| `LANGSMITH_PROMPT_NAME` | LangSmith prompt name | No |
| `STATSIG_CLIENT_ID` | Statsig analytics client ID | No |

## AI Chat Architecture

```
pages/chat.vue
    ↓
/api/chat/index.post.ts
    ↓
AI SDK streamText
    ├─ Qdrant (vector search for knowledge base)
    ├─ DeepInfra (GPT-OSS LLM)
    ├─ Guard Tool (LLM-based content moderation, 5s timeout fallback)
    └─ Upstash Redis (rate limiting)
```

## Contributing

This project uses:
- **Husky** for git hooks
- **Commitlint** for conventional commit enforcement
- **Prettier** for code formatting

Please follow the existing code patterns and commit conventions when contributing.

## License

MIT License - see LICENSE file for details
