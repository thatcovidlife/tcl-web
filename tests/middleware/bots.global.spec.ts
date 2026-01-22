/**
 * Bot Detection Middleware Tests
 *
 * Tests the client-side bot detection middleware that protects against
 * malicious bots and scrapers while allowing legitimate social media crawlers.
 *
 * @see middleware/bots.global.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Test the core bot detection logic without the full Nuxt middleware wrapper
// This allows us to test the patterns and logic in isolation

const MALICIOUS_BOT_PATTERNS =
  /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|python-requests|scrapy|httpclient|node-fetch|axios(?!\/)|postman|libwww/i

const SOCIAL_CRAWLER_PATTERNS = [
  'facebookexternalhit',
  'facebookbot',
  'twitterbot',
  'linkedinbot',
  'pinterestbot',
  'slackbot',
  'discordbot',
  'whatsapp',
  'telegrambot',
  'applebot',
  'googlebot',
  'bingbot',
  'duckduckbot',
]

const isSocialCrawler = (ua: string): boolean => {
  if (!ua) return false
  return SOCIAL_CRAWLER_PATTERNS.some((p) => ua.toLowerCase().includes(p))
}

const CRAWLER_ALLOWED_PATHS = [
  '/.well-known',
  '/robots.txt',
  '/sitemap.xml',
  '/__sitemap__',
  '/api/feed',
]

const isCrawlerAllowedPath = (path: string): boolean => {
  return CRAWLER_ALLOWED_PATHS.some((allowedPath) => path.startsWith(allowedPath))
}

// Core bot detection function (extracted from middleware)
const shouldBlockBot = (ua: string | undefined, path: string): boolean => {
  // Skip for crawler-allowed paths
  if (isCrawlerAllowedPath(path)) {
    return false
  }

  // No user agent - don't block
  if (!ua) {
    return false
  }

  // Allow social crawlers
  if (isSocialCrawler(ua)) {
    return false
  }

  // Block malicious bots
  return MALICIOUS_BOT_PATTERNS.test(ua)
}

describe('Bot Detection Middleware', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ==========================================================================
  // Social Crawler Tests
  // ==========================================================================

  describe('Social Crawler Detection', () => {
    it('should allow Facebook crawler', () => {
      const shouldBlock = shouldBlockBot('facebookexternalhit/1.1', '/chat/test-chat')
      expect(shouldBlock).toBe(false)
    })

    it('should allow Twitter/X crawler', () => {
      const shouldBlock = shouldBlockBot('Twitterbot/1.0', '/chat/test-chat')
      expect(shouldBlock).toBe(false)
    })

    it('should allow LinkedIn crawler', () => {
      const shouldBlock = shouldBlockBot('LinkedInBot/1.0', '/chat/test-chat')
      expect(shouldBlock).toBe(false)
    })

    it('should allow Pinterest crawler', () => {
      const shouldBlock = shouldBlockBot('Pinterestbot/0.1', '/chat/test-chat')
      expect(shouldBlock).toBe(false)
    })

    it('should allow Slack crawler', () => {
      const shouldBlock = shouldBlockBot('Slackbot-LinkExpanding 1.0', '/chat/test-chat')
      expect(shouldBlock).toBe(false)
    })

    it('should allow Discord crawler', () => {
      const shouldBlock = shouldBlockBot('Discordbot/2.0', '/chat/test-chat')
      expect(shouldBlock).toBe(false)
    })

    it('should allow Google crawler', () => {
      const shouldBlock = shouldBlockBot(
        'Mozilla/5.0 (compatible; Googlebot/2.1)',
        '/chat/test-chat',
      )
      expect(shouldBlock).toBe(false)
    })

    it('should allow Bing crawler', () => {
      const shouldBlock = shouldBlockBot(
        'Mozilla/5.0 (compatible; bingbot/2.0)',
        '/chat/test-chat',
      )
      expect(shouldBlock).toBe(false)
    })
  })

  // ==========================================================================
  // Malicious Bot Detection Tests
  // ==========================================================================

  describe('Malicious Bot Detection', () => {
    it('should block HeadlessChrome', () => {
      const shouldBlock = shouldBlockBot(
        'Mozilla/5.0 (HeadlessChrome/120.0.6099.109)',
        '/chat/test-chat',
      )
      expect(shouldBlock).toBe(true)
    })

    it('should block PhantomJS', () => {
      const shouldBlock = shouldBlockBot('PhantomJS/2.1.1', '/chat/test-chat')
      expect(shouldBlock).toBe(true)
    })

    it('should block Puppeteer', () => {
      const shouldBlock = shouldBlockBot(
        'Mozilla/5.0 (X11; Linux x86_64) puppeteer/123.0',
        '/chat/test-chat',
      )
      expect(shouldBlock).toBe(true)
    })

    it('should block Selenium', () => {
      const shouldBlock = shouldBlockBot(
        'Mozilla/5.0 (Windows NT 10.0) selenium/4.0',
        '/chat/test-chat',
      )
      expect(shouldBlock).toBe(true)
    })

    it('should block curl', () => {
      const shouldBlock = shouldBlockBot('curl/7.68.0', '/chat/test-chat')
      expect(shouldBlock).toBe(true)
    })

    it('should block wget', () => {
      const shouldBlock = shouldBlockBot('Wget/1.20.3', '/chat/test-chat')
      expect(shouldBlock).toBe(true)
    })

    it('should block python-requests', () => {
      const shouldBlock = shouldBlockBot(
        'python-requests/2.28.0',
        '/chat/test-chat',
      )
      expect(shouldBlock).toBe(true)
    })

    it('should block Scrapy', () => {
      const shouldBlock = shouldBlockBot('Scrapy/2.5.0', '/chat/test-chat')
      expect(shouldBlock).toBe(true)
    })

    it('should block node-fetch', () => {
      const shouldBlock = shouldBlockBot('node-fetch/1.0', '/chat/test-chat')
      expect(shouldBlock).toBe(true)
    })

    it('should block Postman', () => {
      const shouldBlock = shouldBlockBot('PostmanRuntime/7.29.2', '/chat/test-chat')
      expect(shouldBlock).toBe(true)
    })
  })

  // ==========================================================================
  // Whitelisted Path Tests
  // ==========================================================================

  describe('Crawler Allowed Paths', () => {
    it('should allow crawlers on /robots.txt', () => {
      const shouldBlock = shouldBlockBot('curl/7.68.0', '/robots.txt')
      expect(shouldBlock).toBe(false)
    })

    it('should allow crawlers on /sitemap.xml', () => {
      const shouldBlock = shouldBlockBot('curl/7.68.0', '/sitemap.xml')
      expect(shouldBlock).toBe(false)
    })

    it('should allow crawlers on /.well-known', () => {
      const shouldBlock = shouldBlockBot('curl/7.68.0', '/.well-known/change-password')
      expect(shouldBlock).toBe(false)
    })

    it('should allow crawlers on /api/feed', () => {
      const shouldBlock = shouldBlockBot('curl/7.68.0', '/api/feed?lang=en')
      expect(shouldBlock).toBe(false)
    })

    it('should allow crawlers on /__sitemap__', () => {
      const shouldBlock = shouldBlockBot('curl/7.68.0', '/__sitemap__/urls')
      expect(shouldBlock).toBe(false)
    })
  })

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle missing user agent gracefully', () => {
      const shouldBlock = shouldBlockBot(undefined, '/chat/test-chat')
      expect(shouldBlock).toBe(false)
    })

    it('should handle empty user agent', () => {
      const shouldBlock = shouldBlockBot('', '/chat/test-chat')
      expect(shouldBlock).toBe(false)
    })

    it('should allow legitimate browser user agents', () => {
      const browsers = [
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
      ]

      for (const ua of browsers) {
        const shouldBlock = shouldBlockBot(ua, '/chat/test-chat')
        expect(shouldBlock).toBe(false)
      }
    })

    it('should be case-insensitive for pattern matching', () => {
      const variations = [
        'headlesschrome/120.0',
        'HEADLESSCHROME/120.0',
        'HeAdLeSsChRoMe/120.0',
        'HeadlessChrome/120.0',
      ]

      for (const ua of variations) {
        const shouldBlock = shouldBlockBot(ua, '/chat/test-chat')
        expect(shouldBlock).toBe(true)
      }
    })

    it('should block various headless browser patterns', () => {
      const patterns = ['headless', 'Headless', 'HEADLESS', 'HeAdLeSs']

      for (const pattern of patterns) {
        const shouldBlock = shouldBlockBot(
          `Mozilla/5.0 (${pattern})`,
          '/chat/test-chat',
        )
        expect(shouldBlock).toBe(true)
      }
    })

    it('should block automation tools', () => {
      const tools = ['puppeteer', 'Puppeteer', 'PUPPETEER', 'selenium', 'Selenium']

      for (const tool of tools) {
        const shouldBlock = shouldBlockBot(`Mozilla/5.0 (${tool})`, '/chat/test-chat')
        expect(shouldBlock).toBe(true)
      }
    })

    it('should block http client libraries', () => {
      const clients = ['curl', 'wget', 'python-requests', 'scrapy', 'node-fetch']

      for (const client of clients) {
        const shouldBlock = shouldBlockBot(`${client}/1.0`, '/chat/test-chat')
        expect(shouldBlock).toBe(true)
      }
    })
  })

  // ==========================================================================
  // Pattern Matching Edge Cases
  // ==========================================================================

  describe('Pattern Matching Edge Cases', () => {
    it('should match axios without trailing slash', () => {
      // The pattern has `axios(?!\/)` which is a negative lookahead for /
      // This means "axios" NOT followed by "/" should match
      const shouldBlock = shouldBlockBot('axios', '/chat/test-chat')
      expect(shouldBlock).toBe(true)
    })

    it('should not match axios with trailing slash', () => {
      // "axios/" should NOT match the `axios(?!\/)` pattern because the / after axios
      // fails the negative lookahead
      const shouldBlock = shouldBlockBot('axios/', '/chat/test-chat')
      expect(shouldBlock).toBe(false)
    })

    it('should match axios with version number but no slash', () => {
      // Some axios user agents might be "axios1.0" without a slash
      const shouldBlock = shouldBlockBot('axios1.0', '/chat/test-chat')
      expect(shouldBlock).toBe(true)
    })

    it('should match libwww variations', () => {
      const variations = ['libwww-perl', 'libwww', 'LIBWWW']

      for (const variation of variations) {
        const shouldBlock = shouldBlockBot(variation, '/chat/test-chat')
        expect(shouldBlock).toBe(true)
      }
    })
  })
})
