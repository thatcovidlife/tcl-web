/**
 * Crawler Statistics API Endpoint
 *
 * Provides monitoring data for social media crawler access
 * Helps verify that social platforms are successfully accessing OpenGraph metadata
 */

import {
  getCrawlerName,
  isSocialCrawler,
} from '~/assets/constants/social-crawlers'

// In-memory storage for crawler statistics (would use Redis/DB in production)
const crawlerStats = new Map<
  string,
  {
    count: number
    lastSeen: string
    paths: string[]
    userAgents: Set<string>
  }
>()

export default defineEventHandler((event) => {
  // Log this request if it's from a crawler
  const ua = getHeader(event, 'user-agent') || ''

  if (isSocialCrawler(ua)) {
    const crawlerName = getCrawlerName(ua)
    const path = event.path || '/'

    const existing = crawlerStats.get(crawlerName) || {
      count: 0,
      lastSeen: '',
      paths: [],
      userAgents: new Set<string>(),
    }

    existing.count++
    existing.lastSeen = new Date().toISOString()
    existing.userAgents.add(ua)

    // Keep last 10 unique paths
    if (!existing.paths.includes(path)) {
      existing.paths.unshift(path)
      existing.paths = existing.paths.slice(0, 10)
    }

    crawlerStats.set(crawlerName, existing)
  }

  // Return statistics
  const stats = Array.from(crawlerStats.entries()).map(([crawler, data]) => ({
    crawler,
    count: data.count,
    lastSeen: data.lastSeen,
    recentPaths: data.paths,
    userAgentCount: data.userAgents.size,
  }))

  return {
    timestamp: new Date().toISOString(),
    totalCrawlers: stats.length,
    crawlers: stats.sort((a, b) => b.count - a.count),
    summary: {
      totalRequests: stats.reduce((sum, s) => sum + s.count, 0),
      activeCrawlers: stats.filter((s) => {
        const lastSeen = new Date(s.lastSeen)
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
        return lastSeen > hourAgo
      }).length,
    },
  }
})
