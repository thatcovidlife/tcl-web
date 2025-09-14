# Product Context

## Project Overview

That Covid Life - A platform for COVID-19 information, resources, and community support.

## Mobile Page Modernization

The mobile landing page has been completely modernized with Tailwind CSS, responsive design, shadcn/ui components, and smooth animations.

### Key Features

- Clean, responsive design using Tailwind CSS utility classes
- shadcn/ui Card components with proper CardHeader and CardContent structure
- Motion animations using motion-v for enhanced user experience
- Responsive breakpoints for mobile, tablet, and desktop views
- Proper internationalization support
- Optimized layout for both mobile and desktop experiences

### Page Sections

1. **Hero Section**
   - App title and subtitle with responsive text alignment
   - App store buttons with responsive layout (stacked on mobile, horizontal on desktop)
   - Marketing visual with fade-in animation

2. **Features Section**
   - Three feature cards using shadcn Card components
   - Staggered fade-in and slide-up animations
   - Responsive grid layout (1 column on mobile, 3 columns on desktop)

### Technical Implementation

- Frontend: Vue 3 with Nuxt 3, TypeScript, Tailwind CSS
- UI Components: shadcn/ui (Card, CardHeader, CardContent)
- Animations: motion-v with custom transitions
- Styling: Tailwind CSS utility classes replacing previous SCSS
- Responsive Design: Mobile-first approach with appropriate breakpoints
