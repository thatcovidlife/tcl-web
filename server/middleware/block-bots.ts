import {
  isSocialCrawler,
  isCrawlerAllowedPath,
  getCrawlerName,
} from '~/assets/constants/social-crawlers'

// Malicious bot detection pattern (excludes legitimate social crawlers)
const MALICIOUS_BOT_PATTERN =
  /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|python-requests|scrapy|httpclient|node-fetch|axios(?!\/)|postman|libwww/i

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
  if (
    ALLOWED_PATHS.some((p) => path?.startsWith(p)) ||
    isCrawlerAllowedPath(path || '/')
  ) {
    return
  }

  const ua = getHeader(event, 'user-agent') || ''
  const path_route = event.path || '/'

  if (!ua) {
    return
  }

  // Allow legitimate social media crawlers for OpenGraph metadata access
  if (isSocialCrawler(ua)) {
    console.log('[Security] Middleware: Social crawler allowed', {
      crawler: getCrawlerName(ua),
      path: path_route,
      timestamp: new Date().toISOString(),
    })
    // Set cache headers for crawler responses
    setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=7200')
    return
  }

  // Check against malicious bot pattern
  if (MALICIOUS_BOT_PATTERN.test(ua)) {
    console.warn('[Security] Middleware: Malicious bot blocked', {
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
