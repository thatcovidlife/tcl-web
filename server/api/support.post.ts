import { Resend } from 'resend'
import { captureException } from '@sentry/nuxt'

const resend = new Resend(process.env.RESEND_API_KEY)

export default eventHandler(async (event) => {
  const body = await readBody(event)

  try {
    await resend.emails.send({
      from: 'That Covid Life <no-reply@thatcovid.life>',
      to: [process.env.RESEND_SUPPORT_EMAIL!],
      subject: 'New Support Request',
      replyTo: body.email,
      html: `
        <h1>New Support Request</h1>
        <p><strong>Name:</strong> ${body.from_name}</p>
        <p><strong>Email:</strong> ${body.email}</p>
        <p><strong>Product:</strong> ${body.product}</p>
        <p><strong>Subject:</strong> ${body.subject}</p>
        <p><strong>Message:</strong> ${body.message}</p>
      `,
    })

    return { ok: true }
  } catch (e) {
    const { message } = e as Error
    console.error(message, body)
    captureException(e)
    sendError(
      event,
      createError({ statusCode: 500, statusMessage: message, data: body }),
    )
  }
})
