// Consolidated bot detection pattern for consistency across all layers
const BOT_PATTERN =
  /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|python-requests|scrapy|httpclient|node-fetch|axios|postman|libwww|bot|crawler/i

// Paths that should bypass bot detection
const ALLOWED_PATHS = [
  '/.well-known',
  '/robots.txt',
  '/sitemap.xml',
  '/__sitemap__',
  '/api/feed?lang=all',
  '/api/feed',
  '/api/external/feeds/youtube/feed',
]

export default defineEventHandler((event) => {
  // Skip bot detection for allowed paths
  const path = getHeader(event, 'x-forwarded-for')
    ? event.node.req.url
    : event.path || '/'
  if (ALLOWED_PATHS.some((p) => path?.startsWith(p))) {
    return
  }

  const ua = (getHeader(event, 'user-agent') || '').toLowerCase()
  const path_route = event.path || '/'

  if (!ua) {
    return
  }

  // Check against consolidated bot pattern
  if (BOT_PATTERN.test(ua)) {
    console.warn('[Security] Middleware: Bot blocked', {
      path: path_route,
      ua: ua.substring(0, 50),
      timestamp: new Date().toISOString(),
    })
    setResponseStatus(event, 403)
    setHeader(event, 'Content-Type', 'application/json')
    return {
      error: 'Access Denied',
      message: 'Automated access is not permitted',
      code: 'BOT_DETECTED',
    }
  }

  // Check for suspicious request patterns
  const referer = getHeader(event, 'referer') || ''
  const acceptLanguage = getHeader(event, 'accept-language') || ''

  // Flag requests without proper headers (likely automated)
  if (!acceptLanguage && !referer && ua) {
    console.warn('[Security] Middleware: Suspicious request pattern', {
      path: path_route,
      ua: ua.substring(0, 50),
    })
    setResponseStatus(event, 403)
    return { error: 'Access Denied' }
  }
})
