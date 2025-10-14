# Technical Context

## Core Technologies

- **Nuxt.js 3**: Vue.js meta-framework with server-side rendering, file-based routing, and API routes
- **TypeScript**: Full type safety across the entire application
- **Vue 3**: Progressive JavaScript framework with Composition API
- **Sanity**: Headless CMS for content management with GROQ query language
- **Drizzle ORM**: Type-safe database ORM with SQL-like query builder
- **Sentry**: Comprehensive error tracking and performance monitoring platform
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Pinia**: Intuitive state management for Vue applications

## Development & Build Tools

- **Vite**: Fast build tool and development server
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Commitlint**: Conventional commit messages
- **Husky**: Git hooks for code quality
- **TypeScript**: Strict type checking configuration

## Database & Storage

- **Drizzle ORM**: Type-safe database operations with migrations support
- **Database Monitoring**: All database queries wrapped with Sentry spans for observability
- **Error Handling**: Consistent error handling patterns across all database operations
- **Migration System**: Automated database schema migrations

## API Architecture

- **Server API Routes**: RESTful endpoints in `server/api/` directory following Nuxt 3 conventions
- **Error Handling**: Comprehensive error handling across all endpoints
- **Authentication**: User authentication and authorization where required
- **Performance Monitoring**: Database queries wrapped with Sentry spans for performance tracking
- **Type Safety**: Full TypeScript support with proper request/response typing

## Content Management

- **Sanity Integration**: Headless CMS integration with structured content schemas
- **GROQ Queries**: Powerful querying language for content retrieval
- **Real-time Updates**: Live content updates and preview capabilities
- **Media Management**: Image and asset optimization through Sanity

## State Management

- **Pinia Stores**: Centralized state management with reactive data patterns
- **User Store**: Handles profile updates, authentication, and session management
- **Content Store**: Manages content fetching, caching, and state
- **UI Store**: Handles global UI state and user interactions
- **Sentry Integration**: User context automatically set when updating user information

## Error Tracking & Performance

- **Sentry SDK**: Comprehensive error tracking with custom error boundaries
- **Performance Monitoring**: Database query performance and API endpoint tracking
- **User Context**: Automatic inclusion of user information in error reports
- **Error Boundaries**: React error boundaries for graceful error handling
- **Tracing**: Distributed tracing for understanding application flow

## Internationalization

- **Vue I18n**: Internationalization framework for Vue applications
- **Multi-language Support**: English, Spanish, French, and Portuguese
- **Locale Management**: Dynamic locale switching and content localization
- **SEO Optimization**: Proper hreflang tags for international SEO

## Deployment & DevOps

- **Build Optimization**: Automatic code splitting and asset optimization
- **Environment Configuration**: Multiple environment support (development, staging, production)
- **CI/CD Ready**: CircleCI configuration for automated testing and deployment
- **Performance Budgets**: Monitoring and optimization for Core Web Vitals
