import { parseStringPromise } from 'xml2js'
import * as Sentry from '@sentry/nuxt'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  try {
    const data = await Sentry.startSpan(
      {
        name: 'fetch YouTube feed',
        op: 'external.http',
      },
      async () => {
        return await fetch(
          `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`,
        )
      },
    )
    const xml = await data.text()
    const json = await parseStringPromise(xml)
    if (json?.feed) {
      return json.feed
    } else {
      throw new Error('No feed found')
    }
  } catch (e) {
    Sentry.captureException(e)
    sendError(event, e as Error)
  }
})
