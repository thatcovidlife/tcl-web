# Active Context

## What We're Working On Now

We have successfully refactored the `server/api/contribute.post.ts` endpoint to replace EmailJS with Resend for sending emails. The development server is running and the changes have been deployed.

## Recent Changes

- Replaced EmailJS with Resend in the `contribute.post.ts` API endpoint
- Updated the email sending logic to use Resend's SDK
- The form data is now sent as a preformatted HTML email to 'delivered@resend.dev'

## Next Steps

- Monitor the contribute form to ensure emails are being sent correctly via Resend
- Consider customizing the email template and recipient addresses for production use
- Potentially remove EmailJS environment variables if they are no longer needed by other parts of the application
