/**
 * OpenGraph Metadata Testing Endpoint
 *
 * Returns the OpenGraph metadata for a given URL path
 * Useful for testing what social media crawlers will see
 */

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url) {
    throw createError({
      statusCode: 400,
      message: 'URL parameter is required',
    })
  }

  // Simulate what a crawler would see
  const config = useRuntimeConfig()
  const baseUrl = config.public.siteUrl || 'https://thatcovid.life'
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`

  try {
    // Fetch the page as a crawler would
    const response = await $fetch(fullUrl, {
      headers: {
        'User-Agent':
          'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      },
    })

    // Extract OpenGraph tags from HTML
    const html = response as string
    const ogTags: Record<string, string> = {}
    const twitterTags: Record<string, string> = {}

    // Parse OpenGraph meta tags
    const ogRegex =
      /<meta\s+property=["']og:([^"']+)["']\s+content=["']([^"']+)["']\s*\/?>/gi
    let match
    while ((match = ogRegex.exec(html)) !== null) {
      ogTags[match[1]] = match[2]
    }

    // Parse Twitter meta tags
    const twitterRegex =
      /<meta\s+name=["']twitter:([^"']+)["']\s+content=["']([^"']+)["']\s*\/?>/gi
    while ((match = twitterRegex.exec(html)) !== null) {
      twitterTags[match[1]] = match[2]
    }

    // Extract title and description
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
    const descMatch = html.match(
      /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i,
    )

    return {
      url: fullUrl,
      title: titleMatch ? titleMatch[1] : null,
      description: descMatch ? descMatch[1] : null,
      openGraph: ogTags,
      twitter: twitterTags,
      validation: {
        hasTitle: !!titleMatch,
        hasDescription: !!descMatch,
        hasOgImage: !!ogTags.image,
        hasOgTitle: !!ogTags.title,
        hasOgDescription: !!ogTags.description,
        hasOgType: !!ogTags.type,
        hasOgUrl: !!ogTags.url,
        hasTwitterCard: !!twitterTags.card,
        score: calculateScore(titleMatch, descMatch, ogTags, twitterTags),
      },
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: `Failed to fetch metadata: ${error.message}`,
    })
  }
})

function calculateScore(
  titleMatch: RegExpMatchArray | null,
  descMatch: RegExpMatchArray | null,
  ogTags: Record<string, string>,
  twitterTags: Record<string, string>,
): number {
  let score = 0
  const maxScore = 10

  if (titleMatch) score += 1
  if (descMatch) score += 1
  if (ogTags.title) score += 1
  if (ogTags.description) score += 1
  if (ogTags.image) score += 2
  if (ogTags.type) score += 1
  if (ogTags.url) score += 1
  if (twitterTags.card) score += 1
  if (twitterTags.image) score += 1

  return Math.round((score / maxScore) * 100)
}
