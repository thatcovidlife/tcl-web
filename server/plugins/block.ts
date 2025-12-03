// Shared bot detection pattern consistent with client-side middleware
const BOT_PATTERNS =
  /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|scrapy|bot|crawler|python-requests|httpclient|node-fetch|axios|postman/i
const WHITELISTED_PATHS = ['/.well-known', '/robots.txt', '/sitemap.xml', '/__sitemap__']

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('request', (event) => {
    const { req, res } = event.node
    const ua = (req.headers['user-agent'] || '').toLowerCase()
    const path = req.url || '/'

    // Skip detection for whitelisted paths
    if (WHITELISTED_PATHS.some((p) => path.startsWith(p))) {
      return
    }

    // Check for bot/scraper user agents using regex
    if (BOT_PATTERNS.test(ua)) {
      console.warn('[Security] Server: Bot detected', {
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
