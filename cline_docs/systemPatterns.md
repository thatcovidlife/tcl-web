# System Patterns

## Architecture Overview

- **Full-Stack Framework**: Nuxt.js application with server-side rendering and API routes
- **Headless CMS**: Sanity for content management and editorial workflows
- **Type-Safe Database**: Drizzle ORM for database operations with full TypeScript support
- **Centralized State**: Pinia stores for application state management
- **Performance Monitoring**: Sentry integration for comprehensive observability

## Content Management Patterns

- **Sanity Integration**: All content operations flow through Sanity's GROQ queries
- **Content Types**: Structured content with predefined schemas for articles, videos, and resources
- **Internationalization**: Multi-language content support with Vue I18n
- **Search Integration**: Advanced search functionality across all content types

## Database Operations

- **ORM Layer**: All database queries use Drizzle ORM for type safety
- **Observability**: Database calls are wrapped with Sentry spans for performance monitoring
- **Error Handling**: Consistent error handling patterns across all database operations
- **Transaction Management**: Proper transaction handling for data consistency

## Error Handling & Monitoring

- **Comprehensive Tracking**: Sentry integration for error tracking and performance monitoring
- **User Context**: User context is automatically set in Sentry when available
- **Error Boundaries**: Consistent error patterns across all API routes and components
- **Performance Metrics**: Database query performance tracking and optimization

## API Architecture

- **Server API Routes**: RESTful endpoints in `server/api/` directory following Nuxt 3 conventions
- **Error Handling**: All API endpoints include proper error handling and user feedback
- **Database Integration**: Database queries wrapped with Sentry spans for observability
- **Authentication**: User authentication checks implemented where required
- **Type Safety**: Full TypeScript support with proper type definitions

## State Management

- **Pinia Stores**: Centralized state management with Pinia for user data, content, and UI state
- **User Management**: User store handles profile updates, authentication, and session management
- **Sentry Context**: User context is automatically set when updating user information
- **Reactive Data**: Consistent reactive data patterns across the application

## User Experience Patterns

- **Mobile-First**: Responsive design optimized for mobile devices
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Accessibility**: WCAG compliant interface with proper ARIA labels
- **Performance**: Optimized loading patterns and asset delivery
