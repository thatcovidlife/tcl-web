import {
  isSocialCrawler,
  isCrawlerAllowedPath,
  getCrawlerName,
} from '~/assets/constants/social-crawlers'

// Malicious bot detection pattern (excludes legitimate social crawlers)
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
    const { req, res } = event.node
    const ua = req.headers['user-agent'] || ''
    const path = req.url || '/'

    // Skip detection for whitelisted paths
    if (
      WHITELISTED_PATHS.some((p) => path.startsWith(p)) ||
      isCrawlerAllowedPath(path)
    ) {
      return
    }

    // Allow legitimate social media crawlers
    if (isSocialCrawler(ua)) {
      console.log('[Security] Server: Social crawler allowed', {
        crawler: getCrawlerName(ua),
        path,
        timestamp: new Date().toISOString(),
      })
      // Set optimal cache headers for crawlers
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=7200')
      return
    }

    // Check for malicious bot/scraper user agents
    if (MALICIOUS_BOT_PATTERNS.test(ua)) {
      console.warn('[Security] Server: Malicious bot blocked', {
        path,
        ua: ua.substring(0, 50),
      })
      res.statusCode = 403
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: 'Access Denied',
          message: 'Automated access is not permitted',
        }),
      )
      return
    }

    // Additional checks for common scraping headers
    const suspiciousHeaders = [
      'x-requested-with',
      'x-automation',
      'x-scrapy-splash',
    ]
    const hasSuspiciousHeader = suspiciousHeaders.some(
      (header) => req.headers[header],
    )

    if (hasSuspiciousHeader) {
      console.warn('[Security] Server: Suspicious headers detected', { path })
      res.statusCode = 403
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Access Denied' }))
    }
  })
})
