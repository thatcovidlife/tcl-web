import {
  isSocialCrawler,
  isCrawlerAllowedPath,
  getCrawlerName,
} from '@/assets/constants/social-crawlers'

// Malicious bot detection pattern (excludes legitimate social crawlers)
const MALICIOUS_BOT_PATTERNS =
  /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|python-requests|scrapy|httpclient|node-fetch|axios(?!\/)|postman|libwww/i

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware for crawler-allowed paths
  if (isCrawlerAllowedPath(to.path)) {
    return
  }

  try {
    const ua = navigator?.userAgent

    // No user agent detected
    if (!ua) {
      return
    }

    // Allow legitimate social media crawlers for OpenGraph access
    if (isSocialCrawler(ua)) {
      console.log('[Security] Social crawler allowed:', {
        crawler: getCrawlerName(ua),
        path: to.path,
      })
      return
    }

    // Detect malicious bots and scrapers
    if (MALICIOUS_BOT_PATTERNS.test(ua)) {
      console.warn('[Security] Malicious bot/scraper blocked', {
        path: to.path,
        ua: ua.substring(0, 50),
      })
      return navigateTo('/blocked')
    }

    // Verify JavaScript is enabled and runtime is intact
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      console.warn('[Security] Invalid runtime detected', { path: to.path })
      return navigateTo('/blocked')
    }
  } catch (error) {
    // Log error but don't block legitimate users on middleware failure
    console.error('[Middleware] Bot detection error:', error)
  }
})
