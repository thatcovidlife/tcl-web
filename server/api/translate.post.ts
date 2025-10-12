import { Translator } from 'deepl-node'
import { consola } from 'consola'
import * as Sentry from '@sentry/nuxt'

export default eventHandler(async (event) => {
  const { locale = null, text = null } = await readBody(event)

  if (!locale) {
    sendError(
      event,
      createError({ statusCode: 400, statusMessage: 'No locale specified' }),
    )
  }

  if (!text) {
    sendError(
      event,
      createError({ statusCode: 400, statusMessage: 'No text supplied' }),
    )
  }

  const d = new Translator(process.env.DEEPL_API_KEY as string)
  const usage = await Sentry.startSpan(
    {
      name: 'get DeepL usage',
      op: 'external.http',
    },
    async () => {
      return await d.getUsage()
    },
  )

  consola.info(
    `[${Date.parse(new Date().toString())}] DeepL usage: ${JSON.stringify(usage.character)}`,
  )

  if (usage.anyLimitReached()) {
    sendError(
      event,
      createError({ statusCode: 429, statusMessage: 'Too many requests' }),
    )
  }

  try {
    return await Sentry.startSpan(
      {
        name: 'translate text with DeepL',
        op: 'external.http',
      },
      async () => {
        return await d.translateText(text, null, locale, {
          tagHandling: 'html',
        })
      },
    )
  } catch (e) {
    const { message } = e as Error
    console.error(e)
    Sentry.captureException(e)
    sendError(event, createError({ statusCode: 500, statusMessage: message }))
  }
})
