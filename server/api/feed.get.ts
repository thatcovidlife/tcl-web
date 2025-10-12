import { Feed } from 'feed'
import rssFeedQuery from '@/sanity/queries/rssFeed.sanity'
import { RSS_FEED_QUERYResult } from '@/sanity/types'
import { isExternalLink, isNews, isLibrary } from '@/assets/utils/article-types'
import * as Sentry from '@sentry/nuxt'

export default eventHandler(async (event) => {
  const { fetch } = useSanity()

  const query = getQuery(event)
  const locale = query?.lang || 'en'

  const { origin: BASE_URL } = getRequestURL(event)

  try {
    const { entries, settings } = await Sentry.startSpan(
      {
        name: 'fetch RSS feed data',
        op: 'database.query',
      },
      async () => {
        return await fetch<RSS_FEED_QUERYResult>(rssFeedQuery, { locale })
      },
    )

    const feed = new Feed({
      title: settings?.title as string,
      description: settings?.description,
      id: `${BASE_URL}/`,
      link: `${BASE_URL}/`,
      language: locale as string,
      image: settings?.image as string,
      favicon: BASE_URL + '/favicon.ico',
      copyright: `All rights reserved ${new Date().getFullYear()}, ${settings?.author.name}.`,
      updated: entries?.[0] ? new Date(entries[0]?.updatedAt) : undefined,
      author: {
        email: settings?.author.email as string,
        link: BASE_URL,
        name: settings?.author.name as string,
      },
    })

    entries.forEach((entry: any) => {
      const title =
        isNews(entry.type) || isLibrary(entry.type)
          ? `${entry.source}: ${entry.title}`
          : entry.title
      const link = isExternalLink(entry.type)
        ? entry.link
        : `${BASE_URL}${entry.slug}`
      const author = entry.source || entry.author?.name || 'That Covid Life'
      const description = entry.description || ''

      feed.addItem({
        title: title as string,
        description: description ? `${description}...` : undefined,
        published: new Date(entry.publishedAt),
        id: entry.id,
        link: link as string,
        date: new Date(entry.publishedAt),
        image: entry.image as string,
        author: [author as any],
        category: [{ name: entry.category as string }],
      })
    })

    setHeader(event, 'Content-Type', 'application/xml')

    return feed.rss2()
  } catch (e) {
    const { message } = e as Error
    console.log('error', message)
    Sentry.captureException(e)
    return {
      error: message,
    }
  }
})
