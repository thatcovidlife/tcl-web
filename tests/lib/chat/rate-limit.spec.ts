/**
 * Chat Rate Limiting Tests
 *
 * Tests the Upstash Redis rate limiting configuration and behavior.
 *
 * @see lib/chat/rate-limit.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'

// Mock Upstash Redis before importing
const mockRedisInstance = {
  url: 'https://test.upstash.io',
  token: 'test-token',
}

const mockRedis = vi.fn(() => mockRedisInstance)

const mockSlidingWindowConfig = {
  type: 'sliding-window',
  maxRequests: 100,
  duration: '60s',
}

const mockRatelimitInstance = {
  redis: mockRedisInstance,
  limiter: mockSlidingWindowConfig,
  analytics: true,
  prefix: '@upstash/ratelimit',
  limit: vi.fn().mockResolvedValue({
    success: true,
    remaining: 95,
    reset: Date.now() + 60000,
    limit: 100,
  }),
}

// Mock Redis class
vi.mock('@upstash/redis', () => ({
  Redis: mockRedis,
}))

// Mock Ratelimit class with static method
const MockRatelimit = vi.fn().mockImplementation(() => mockRatelimitInstance)
MockRatelimit.slidingWindow = vi.fn(() => mockSlidingWindowConfig)

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: MockRatelimit,
}))

describe('Chat Rate Limiting', () => {
  let rateLimitModule: any

  beforeAll(async () => {
    // Set required environment variables before importing
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
    process.env.RATE_LIMIT_MAX_REQUESTS = '100'
    process.env.RATE_LIMIT_WINDOW = '60s'
    process.env.RATE_LIMIT_PREFIX = '@upstash/ratelimit'

    rateLimitModule = await import('~/lib/chat/rate-limit')
  })

  beforeEach(() => {
    // Don't clear mocks - they were called during module import
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // Manually restore only console mocks, not module-level mocks
    // (module-level mocks need to preserve call history for assertions)
    const consoleLog = console.log as any
    const consoleError = console.error as any
    if (consoleLog.mockRestore) consoleLog.mockRestore()
    if (consoleError.mockRestore) consoleError.mockRestore()
  })

  // ==========================================================================
  // Configuration Tests
  // ==========================================================================

  describe('Configuration', () => {
    it('should initialize with correct config', () => {
      const { ratelimit } = rateLimitModule

      expect(ratelimit).toBeDefined()
      expect(ratelimit.redis).toBeDefined()
    })

    it('should use sliding window algorithm', () => {
      const { ratelimit } = rateLimitModule

      expect(ratelimit.limiter).toBeDefined()
      expect(ratelimit.limiter.type).toBe('sliding-window')
      expect(ratelimit.limiter.maxRequests).toBe(100)
      expect(ratelimit.limiter.duration).toBe('60s')
    })

    it('should have analytics enabled', () => {
      const { ratelimit } = rateLimitModule

      expect(ratelimit.analytics).toBe(true)
    })

    it('should have correct prefix', () => {
      const { ratelimit } = rateLimitModule

      expect(ratelimit.prefix).toBe('@upstash/ratelimit')
    })

    it('should call Redis with correct config', () => {
      expect(mockRedis).toHaveBeenCalledWith({
        url: 'https://test.upstash.io',
        token: 'test-token',
      })
    })

    it('should call slidingWindow with correct parameters', () => {
      expect(MockRatelimit.slidingWindow).toHaveBeenCalledWith(100, '60s')
    })

    it('should export ratelimit instance', () => {
      expect(rateLimitModule.ratelimit).toBeDefined()
    })
  })

  // ==========================================================================
  // Rate Limiting Logic Tests
  // ==========================================================================

  describe('Rate Limiting Logic', () => {
    it('should have limit method available', async () => {
      const { ratelimit } = rateLimitModule

      const result = await ratelimit.limit()

      expect(result.success).toBe(true)
      expect(result.remaining).toBe(95)
      expect(result.limit).toBe(100)
    })

    it('should track remaining requests', async () => {
      const { ratelimit } = rateLimitModule

      const result = await ratelimit.limit()

      expect(result.remaining).toBeGreaterThanOrEqual(0)
      expect(result.remaining).toBeLessThanOrEqual(100)
    })

    it('should provide reset timestamp', async () => {
      const { ratelimit } = rateLimitModule

      const result = await ratelimit.limit()

      expect(result.reset).toBeDefined()
      expect(result.reset).toBeGreaterThan(Date.now())
    })
  })

  // ==========================================================================
  // Export Tests
  // ==========================================================================

  describe('Exports', () => {
    it('should export only ratelimit', () => {
      const keys = Object.keys(rateLimitModule)
      expect(keys).toEqual(['ratelimit'])
    })
  })
})
