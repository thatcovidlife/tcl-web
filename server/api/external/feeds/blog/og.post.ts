import ogs from 'open-graph-scraper'
import { captureException } from '@sentry/nuxt'

export default defineEventHandler(async (event) => {
  const { posts } = await readBody(event)

  try {
    const info = await Promise.all(posts.map((url: string) => ogs({ url })))

    return info
      .map(({ result }) => result || null)
      .filter((r) => r !== null && r.success)
      .map((info) => {
        console.log('info', info)
        return {
          id: crypto.randomUUID(),
          date: info.jsonLD?.[0]?.datePublished?.substr(0, 10),
          description: info.ogDescription
            ? info.ogDescription.substr(0, 128) + '...'
            : null,
          image: info.ogImage[0],
          locale: info.ogLocale,
          siteName: info.ogSiteName,
          title: info.ogTitle,
          type: info.ogType,
          url: info.ogUrl,
        }
      })
  } catch (e) {
    captureException(e)
    throw e
  }
})
