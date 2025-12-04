// Memoized bot detection pattern for performance
const BOT_PATTERNS =
  /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|scrapy|bot|crawler/i

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware for static/public routes that don't need protection
  if (
    to.path.startsWith('/.well-known') ||
    to.path.startsWith('/robots') ||
    to.path.startsWith('/sitemap') ||
    to.path.startsWith('/api/feed?lang=all') ||
    to.path.startsWith('/api/feed') ||
    to.path.startsWith('/api/external/feeds/youtube/feed')
  ) {
    return
  }

  try {
    const ua = navigator?.userAgent

    // No user agent detected
    if (!ua) {
      return
    }

    // Detect headless browsers and scrapers with expanded patterns
    if (BOT_PATTERNS.test(ua)) {
      console.warn('[Security] Bot/scraper detected', {
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
