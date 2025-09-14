# Product Context

## Project Overview

That Covid Life - A platform for COVID-19 information, resources, and community support.

## Support Form Implementation

A modern, animated support form has been created to allow users to submit support requests for the website and mobile app.

### Key Features

- Clean, responsive design using shadcn/ui components
- Motion animations for enhanced user experience
- Form validation using vee-validate and zod
- Product selection dropdown (website/mobile app)
- Security with NuxtTurnstile
- Proper translation support
- Email notifications via Resend API

### Form Fields

- Name (pre-filled from user account when available)
- Email (pre-filled from user account when available)
- Product (website/mobile app dropdown)
- Subject
- Message
- Turnstile verification

### Technical Implementation

- Frontend: Vue 3 with Nuxt 3, TypeScript, Tailwind CSS
- Form Library: vee-validate with zod validation
- UI Components: shadcn/ui
- Animations: motion-v
- Backend: Nuxt API route with Resend for email delivery
