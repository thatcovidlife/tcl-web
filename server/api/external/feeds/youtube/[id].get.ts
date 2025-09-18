import { parseStringPromise } from 'xml2js'
import { captureException } from '@sentry/nuxt'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  try {
    const data = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`,
    )
    const xml = await data.text()
    const json = await parseStringPromise(xml)
    if (json?.feed) {
      return json.feed
    } else {
      throw new Error('No feed found')
    }
  } catch (e) {
    captureException(e)
    sendError(event, e as Error)
  }
})
