import {
  isSocialCrawler,
  isCrawlerAllowedPath,
  getCrawlerName,
} from '~/assets/constants/social-crawlers'

const MALICIOUS_BOT_PATTERNS =
  /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|python-requests|scrapy|httpclient|node-fetch|axios(?!\/)|postman|libwww/i

const WHITELISTED_PATHS = [
  '/.well-known',
  '/robots.txt',
  '/sitemap.xml',
  '/__sitemap__',
  '/api/feed?lang=all',
  '/api/feed',
  '/api/external/feeds/youtube/feed',
]

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('request', (event) => {
    const ua = getHeader(event, 'user-agent') || ''
    const path = event.path || '/'

    if (
      WHITELISTED_PATHS.some((p) => path.startsWith(p)) ||
      isCrawlerAllowedPath(path)
    ) {
      return
    }

    if (isSocialCrawler(ua)) {
      console.log('[Security] Server: Social crawler allowed', {
        crawler: getCrawlerName(ua),
        path,
        timestamp: new Date().toISOString(),
      })
      setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=7200')
      return
    }

    if (MALICIOUS_BOT_PATTERNS.test(ua)) {
      console.warn('[Security] Server: Malicious bot blocked', {
        path,
        ua: ua.substring(0, 50),
      })
      setResponseStatus(event, 403)
      setHeader(event, 'Content-Type', 'application/json')
      return {
        error: 'Access Denied',
        message: 'Automated access is not permitted',
      }
    }

    const suspiciousHeaders = [
      'x-requested-with',
      'x-automation',
      'x-scrapy-splash',
    ]
    const hasSuspiciousHeader = suspiciousHeaders.some((header) =>
      getHeader(event, header),
    )

    if (hasSuspiciousHeader) {
      console.warn('[Security] Server: Suspicious headers detected', { path })
      setResponseStatus(event, 403)
      setHeader(event, 'Content-Type', 'application/json')
      return { error: 'Access Denied' }
    }
  })
})
