import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default eventHandler(async (event) => {
  const body = await readBody(event)

  try {
    await resend.emails.send({
      from: 'That Covid Life <no-reply@thatcovid.life>',
      to: [
        process.env.RESEND_RECIPIENT_EMAIL_1!,
        process.env.RESEND_RECIPIENT_EMAIL_2!,
      ],
      subject: 'New Contribution',
      html: `
        <h1>New Contribution</h1>
        <p><strong>Name:</strong> ${body.from_name}</p>
        <p><strong>Email:</strong> ${body.email}</p>
        <p><strong>Type:</strong> ${body.category}</p>
        <p><strong>Description:</strong> ${body.description}</p>
      `,
    })

    return { ok: true }
  } catch (e) {
    const { message } = e as Error
    console.error(message, body)
    sendError(
      event,
      createError({ statusCode: 500, statusMessage: message, data: body }),
    )
  }
})
