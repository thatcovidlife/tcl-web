import { consola } from 'consola'
import * as Sentry from '@sentry/nuxt'

const DEEPL_API_BASE = 'https://api-free.deepl.com/v2'

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

  const rc = useRuntimeConfig()
  const apiKey = rc.deeplApiKey

  const usage = await Sentry.startSpan(
    {
      name: 'get DeepL usage',
      op: 'external.http',
    },
    async () => {
      const response = await fetch(`${DEEPL_API_BASE}/usage`, {
        headers: { Authorization: `DeepL-Auth-Key ${apiKey}` },
      })
      return response.json() as Promise<{ character: { count: number; limit: number } }>
    },
  )

  consola.info(
    `[${Date.parse(new Date().toString())}] DeepL usage: ${JSON.stringify(usage.character)}`,
  )

  if (usage.character.count >= usage.character.limit) {
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
        const response = await fetch(`${DEEPL_API_BASE}/translate`, {
          method: 'POST',
          headers: {
            Authorization: `DeepL-Auth-Key ${apiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            text: text as string,
            target_lang: locale as string,
            tag_handling: 'html',
          }),
        })

        const result = (await response.json()) as {
          translations: { text: string; detected_source_language: string }[]
        }
        return result.translations[0]
      },
    )
  } catch (e) {
    const { message } = e as Error
    console.error(e)
    Sentry.captureException(e)
    sendError(event, createError({ statusCode: 500, statusMessage: message }))
  }
})
