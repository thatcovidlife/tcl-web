# System Patterns

## Form Implementation Patterns

### Support Form

- Uses `components/ui/form` for structured form components
- Implements vee-validate with zod schemas for validation
- Uses motion-v for animations with fade-in and slide-up effects
- Includes NuxtTurnstile for security
- Follows the same styling pattern as contribute form
- Uses proper translation keys from i18n/locales/en.ts

### API Route Pattern

- Uses Resend for email delivery
- Implements proper error handling with sendError
- Returns { ok: true } on success
- Logs errors with request body for debugging

### Form Field Patterns

- Each field uses FormItem, FormLabel, FormControl, and FormMessage
- Select components use SelectTrigger, SelectValue, and SelectContent
- Textareas have configurable row count
- All fields bind to form using v-bind="componentField"

### Animation Patterns

- Initial state: opacity: 0, y: 20
- Final state: opacity: 1, y: 0
- Transition duration: 0.5 seconds
- Applied to container div for consistent experience
