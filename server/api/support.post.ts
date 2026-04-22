import * as Sentry from '@sentry/nuxt'

export default eventHandler(async (event) => {
  const body = await readBody(event)
  const rc = useRuntimeConfig()

  try {
    await Sentry.startSpan(
      {
        name: 'send support email',
        op: 'external.http',
      },
      async () => {
        return await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${rc.resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'That Covid Life <no-reply@thatcovid.life>',
            to: [rc.resendSupportEmail],
            subject: 'New Support Request',
            reply_to: body.email,
            html: `
        <h1>New Support Request</h1>
        <p><strong>Name:</strong> ${body.from_name}</p>
        <p><strong>Email:</strong> ${body.email}</p>
        <p><strong>Product:</strong> ${body.product}</p>
        <p><strong>Subject:</strong> ${body.subject}</p>
        <p><strong>Message:</strong> ${body.message}</p>
      `,
          }),
        })
      },
    )

    return { ok: true }
  } catch (e) {
    const { message } = e as Error
    console.error(message, body)
    Sentry.captureException(e)
    sendError(
      event,
      createError({ statusCode: 500, statusMessage: message, data: body }),
    )
  }
})
