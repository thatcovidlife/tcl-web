import * as Sentry from '@sentry/nuxt'

function extractMeta(html: string, property: string): string | null {
  const re1 = new RegExp(
    `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`,
    'i',
  )
  const re2 = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`,
    'i',
  )
  return html.match(re1)?.[1] || html.match(re2)?.[1] || null
}

function extractOgImage(html: string): { url: string } | null {
  const url = extractMeta(html, 'og:image')
  return url ? { url } : null
}

async function fetchOgData(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; ThatCovidLife/1.0; +https://thatcovid.life)',
    },
  })
  const html = await response.text()

  const title = extractMeta(html, 'og:title')
  const success = !!title

  return {
    success,
    ogTitle: title,
    ogDescription: extractMeta(html, 'og:description'),
    ogImage: extractOgImage(html) ? [extractOgImage(html)] : [],
    ogUrl: extractMeta(html, 'og:url'),
    ogType: extractMeta(html, 'og:type'),
    ogSiteName: extractMeta(html, 'og:site_name'),
    ogLocale: extractMeta(html, 'og:locale'),
    jsonLD: extractJsonLD(html),
  }
}

function extractJsonLD(html: string): Record<string, unknown>[] {
  const matches =
    html.match(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ) || []
  return matches
    .map((m) => {
      const jsonStr = m.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '')
      try {
        return JSON.parse(jsonStr)
      } catch {
        return null
      }
    })
    .filter(Boolean) as Record<string, unknown>[]
}

export default defineEventHandler(async (event) => {
  const { posts } = await readBody(event)

  try {
    const info = await Sentry.startSpan(
      {
        name: 'fetch Open Graph data',
        op: 'external.http',
      },
      async () => {
        return await Promise.all(
          (posts as string[]).map((url) => fetchOgData(url)),
        )
      },
    )

    return info
      .filter((r) => r.success)
      .map((og) => ({
        id: crypto.randomUUID(),
        date: (og.jsonLD?.[0]?.datePublished as string)?.substr(0, 10),
        description: og.ogDescription
          ? og.ogDescription.substr(0, 128) + '...'
          : null,
        image: og.ogImage?.[0],
        locale: og.ogLocale,
        siteName: og.ogSiteName,
        title: og.ogTitle,
        type: og.ogType,
        url: og.ogUrl,
      }))
  } catch (e) {
    Sentry.captureException(e)
    throw e
  }
})
