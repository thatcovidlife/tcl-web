/**
 * Social Media Crawler Configuration
 *
 * Comprehensive list of legitimate social media platform crawlers that need
 * access to OpenGraph meta tags for content preview generation.
 *
 * References:
 * - Facebook: https://developers.facebook.com/docs/sharing/webmasters/crawler
 * - Twitter: https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started
 * - LinkedIn: https://www.linkedin.com/help/linkedin/answer/a521928
 * - Pinterest: https://help.pinterest.com/en/business/article/pinterest-bot
 * - Slack: https://api.slack.com/robots
 * - Discord: https://discord.com/developers/docs/reference#user-agent
 * - WhatsApp: https://www.whatsapp.com/legal/terms-of-service
 */

/**
 * Social media crawler user-agent patterns
 * These crawlers need access to fetch OpenGraph metadata for link previews
 */
export const SOCIAL_CRAWLER_PATTERNS = [
  // Facebook crawlers
  'facebookexternalhit',
  'Facebookbot',
  'FacebookCatalog',
  'facebook-iabot',

  // Twitter/X crawlers
  'Twitterbot',
  'TwitterAuditBot',

  // LinkedIn crawlers
  'LinkedInBot',
  'linkedin',

  // Pinterest crawler
  'Pinterestbot',
  'Pinterest',

  // Slack crawler
  'Slackbot',
  'Slack-ImgProxy',

  // Discord crawler
  'Discordbot',

  // WhatsApp crawler
  'WhatsApp',

  // Telegram crawler
  'TelegramBot',

  // iMessage/Apple
  'Applebot',
  'applebot',

  // Skype
  'SkypeUriPreview',

  // Signal
  'Signal',

  // Reddit
  'Redditbot',

  // Mastodon
  'Mastodon',

  // Google Search (for rich snippets)
  'Googlebot',
  'Google-InspectionTool',
  'GoogleOther',

  // Bing
  'bingbot',
  'BingPreview',

  // DuckDuckGo
  'DuckDuckBot',

  // Yahoo
  'Slurp',

  // Other legitimate crawlers
  'Embedly',
  'Iframely',
  'Outbrain',
  'Flipboard',
  'Qwantify',
  'Yandex',
] as const

/**
 * Compiled regex pattern for efficient user-agent matching
 * Case-insensitive to catch all variations
 */
export const SOCIAL_CRAWLER_REGEX = new RegExp(
  SOCIAL_CRAWLER_PATTERNS.join('|'),
  'i',
)

/**
 * Check if a user-agent string belongs to a legitimate social media crawler
 * @param userAgent - The user-agent string to check
 * @returns True if the user-agent is a recognized social crawler
 */
export function isSocialCrawler(userAgent: string): boolean {
  if (!userAgent) return false
  return SOCIAL_CRAWLER_REGEX.test(userAgent)
}

/**
 * Extract crawler name from user-agent for logging purposes
 * @param userAgent - The user-agent string
 * @returns The detected crawler name or 'unknown'
 */
export function getCrawlerName(userAgent: string): string {
  if (!userAgent) return 'unknown'

  const lowerUA = userAgent.toLowerCase()

  for (const pattern of SOCIAL_CRAWLER_PATTERNS) {
    if (lowerUA.includes(pattern.toLowerCase())) {
      return pattern
    }
  }

  return 'unknown'
}

/**
 * Paths that should always be accessible to crawlers
 * These are essential for proper site indexing and preview generation
 */
export const CRAWLER_ALLOWED_PATHS = [
  '/.well-known',
  '/robots.txt',
  '/sitemap.xml',
  '/__sitemap__',
  '/api/feed',
  '/api/feed?lang=all',
  '/api/external/feeds',
] as const

/**
 * Check if a path should always be accessible to crawlers
 * @param path - The URL path to check
 * @returns True if the path should be accessible to all crawlers
 */
export function isCrawlerAllowedPath(path: string): boolean {
  return CRAWLER_ALLOWED_PATHS.some((allowedPath) =>
    path.startsWith(allowedPath),
  )
}
