# Technical Context

## Technologies Used

### Frontend

- **Vue 3** with Composition API
- **Nuxt 3** for SSR and routing
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **motion-v** for animations
- **vee-validate** for form validation
- **zod** for schema validation
- **vue-sonner** for toast notifications

### Backend

- **Nuxt API Routes** for serverless functions
- **Resend** for email delivery
- **NuxtTurnstile** for bot protection

### Form Components

- Form, FormField, FormItem, FormControl, FormLabel, FormMessage from `components/ui/form`
- Input, Textarea, Button, Select from `components/ui`
- Motion animations using `motion-v`

### State Management

- **useUserStore** for user information
- **useForm** from vee-validate for form state
- **ref** for reactive values

### Internationalization

- **i18n** with locale files in `i18n/locales/`
- Translation keys organized by feature (support, contribute, etc.)

### Email System

- Resend API for sending emails
- HTML email templates with form data
- Environment variables for email configuration
