import { consola } from 'consola'
import { Feed } from 'feed'
import { parseStringPromise } from 'xml2js'
import _ from 'lodash'
import * as Sentry from '@sentry/nuxt'

import ytFeedQuery from '@/sanity/queries/ytFeed.sanity'
import { YT_FEED_QUERYResult } from '@/sanity/types'

// type YtFeed = {
//   feedURL: string;
// }

type Entry = {
  author: {
    link: string
    name: string
  }
  description: string
  id: string
  link: string
  publicationDate: Date
  title: string
  thumbnail: string
}

const mapEntries = (entry: any): Entry => {
  return {
    author: {
      link: entry.author[0].uri[0],
      name: entry.author[0].name[0],
    },
    description:
      entry['media:group'][0]['media:description'][0]
        .split('')
        .slice(0, 252)
        .join('') + '...',
    id: entry.id[0],
    link: entry.link[0].$.href,
    publicationDate: new Date(entry.published[0]),
    title: entry.title[0],
    thumbnail: entry['media:group'][0]['media:thumbnail'][0].$.url,
  }
}

export default defineEventHandler(async (event) => {
  const { fetch: sanityFetch } = useSanity()
  const { origin: BASE_URL } = getRequestURL(event)

  try {
    const feedUrls = await Sentry.startSpan(
      {
        name: 'fetch YouTube feed URLs',
        op: 'database.query',
      },
      async () => {
        return await sanityFetch<YT_FEED_QUERYResult>(ytFeedQuery)
      },
    )
    const calls = feedUrls.map(async ({ feedURL }) => {
      try {
        const data = await fetch(feedURL as string)
        const xml = await data.text()
        const { feed } = await parseStringPromise(xml)
        return feed.entry.map(mapEntries)
      } catch (e) {
        consola.error(e)
        return {}
      }
    })
    const feeds = await Promise.all(calls)
    const sorted = _.orderBy(feeds.flat(), 'publicationDate', 'desc')
    const feedEntries = sorted.slice(0, 20)

    const feed = new Feed({
      title: 'Covidnet Feed',
      description: 'RSS Feed for Covidnet videos',
      id: `${BASE_URL}/`,
      link: `${BASE_URL}/`,
      language: 'en',
      image:
        'https://cdn.sanity.io/images/yt0dcu6v/production/def76fe97d0b33358120bd7da553abba52a939d2-1080x1080.jpg',
      favicon: BASE_URL + '/favicon.ico',
      copyright: `All rights reserved ${new Date().getFullYear()}, That Covid Life.`,
      updated: feedEntries?.[0]
        ? new Date(feedEntries[0]?.publicationDate)
        : undefined,
      author: {
        email: 'contact@thatcovid.life',
        link: BASE_URL,
        name: 'That Covid Life',
      },
    })

    feedEntries.forEach((entry) => {
      feed.addItem({
        title: entry.title,
        description: entry.description || '',
        published: entry.publicationDate,
        id: entry.id,
        link: entry.link,
        date: entry.publicationDate,
        image: entry.thumbnail,
        author: [entry.author],
        category: [
          { name: 'YouTube' },
          { name: 'Video' },
          { name: 'Covid-19' },
        ],
      })
    })

    setHeader(event, 'Content-Type', 'application/xml')

    return feed.rss2()
  } catch (e) {
    consola.error(e)
    Sentry.captureException(e)
    return null
  }
})
