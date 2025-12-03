// @ts-nocheck
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { defineEventHandler, setHeader, getHeader } from 'h3'
import { describe, it, expect, beforeEach } from 'vitest'

// Import the middleware to test
import blockBotsMiddleware from '../../../server/middleware/block-bots'

describe('Server Middleware > block-bots', () => {
  describe('Legitimate user agents', () => {
    it('should allow legitimate Chrome browser', async () => {
      const handler = registerEndpoint('/api/test', defineEventHandler(blockBotsMiddleware))
      
      const response = await $fetch('/api/test', {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'accept-language': 'en-US,en;q=0.9',
          'referer': 'https://example.com'
        }
      })
      
      // Should not return a blocking response
      expect(response).toBeUndefined()
    })

    it('should allow legitimate Firefox browser', async () => {
      const handler = registerEndpoint('/api/test-firefox', defineEventHandler(blockBotsMiddleware))
      
      const response = await $fetch('/api/test-firefox', {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
          'accept-language': 'en-US,en;q=0.5'
        }
      })
      
      expect(response).toBeUndefined()
    })

    it('should allow legitimate Safari browser', async () => {
      const handler = registerEndpoint('/api/test-safari', defineEventHandler(blockBotsMiddleware))
      
      const response = await $fetch('/api/test-safari', {
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
          'accept-language': 'en-US'
        }
      })
      
      expect(response).toBeUndefined()
    })

    it('should allow legitimate mobile browser', async () => {
      const handler = registerEndpoint('/api/test-mobile', defineEventHandler(blockBotsMiddleware))
      
      const response = await $fetch('/api/test-mobile', {
        headers: {
          'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          'accept-language': 'en-US'
        }
      })
      
      expect(response).toBeUndefined()
    })
  })

  describe('Bot detection patterns', () => {
    it('should block HeadlessChrome user agent', async () => {
      const handler = registerEndpoint('/api/test-headless', defineEventHandler(blockBotsMiddleware))
      
      try {
        await $fetch('/api/test-headless', {
          headers: {
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36',
            'accept-language': 'en-US'
          }
        })
        // Should not reach here
        expect.fail('Request should have been blocked')
      } catch (error) {
        expect(error.statusCode).toBe(403)
        expect(error.data.code).toBe('BOT_DETECTED')
        expect(error.data.message).toBe('Automated access is not permitted')
      }
    })

    it('should block puppeteer user agent', async () => {
      const handler = registerEndpoint('/api/test-puppeteer', defineEventHandler(blockBotsMiddleware))
      
      try {
        await $fetch('/api/test-puppeteer', {
          headers: {
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 puppeteer',
            'accept-language': 'en-US'
          }
        })
        expect.fail('Request should have been blocked')
      } catch (error) {
        expect(error.statusCode).toBe(403)
        expect(error.data.code).toBe('BOT_DETECTED')
      }
    })

    it('should block selenium user agent', async () => {
      const handler = registerEndpoint('/api/test-selenium', defineEventHandler(blockBotsMiddleware))
      
      try {
        await $fetch('/api/test-selenium', {
          headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Selenium',
            'accept-language': 'en-US'
          }
        })
        expect.fail('Request should have been blocked')
      } catch (error) {
        expect(error.statusCode).toBe(403)
        expect(error.data.code).toBe('BOT_DETECTED')
      }
    })

    it('should block curl user agent', async () => {
      const handler = registerEndpoint('/api/test-curl', defineEventHandler(blockBotsMiddleware))
      
      try {
        await $fetch('/api/test-curl', {
          headers: {
            'user-agent': 'curl/7.68.0'
          }
        })
        expect.fail('Request should have been blocked')
      } catch (error) {
        expect(error.statusCode).toBe(403)
        expect(error.data.code).toBe('BOT_DETECTED')
      }
    })

    it('should block python-requests user agent', async () => {
      const handler = registerEndpoint('/api/test-python', defineEventHandler(blockBotsMiddleware))
      
      try {
        await $fetch('/api/test-python', {
          headers: {
            'user-agent': 'python-requests/2.31.0'
          }
        })
        expect.fail('Request should have been blocked')
      } catch (error) {
        expect(error.statusCode).toBe(403)
        expect(error.data.code).toBe('BOT_DETECTED')
      }
    })

    it('should block generic bot user agent', async () => {
      const handler = registerEndpoint('/api/test-bot', defineEventHandler(blockBotsMiddleware))
      
      try {
        await $fetch('/api/test-bot', {
          headers: {
            'user-agent': 'SomeBot/1.0'
          }
        })
        expect.fail('Request should have been blocked')
      } catch (error) {
        expect(error.statusCode).toBe(403)
        expect(error.data.code).toBe('BOT_DETECTED')
      }
    })

    it('should block crawler user agent', async () => {
      const handler = registerEndpoint('/api/test-crawler', defineEventHandler(blockBotsMiddleware))
      
      try {
        await $fetch('/api/test-crawler', {
          headers: {
            'user-agent': 'MyCrawler/2.0'
          }
        })
        expect.fail('Request should have been blocked')
      } catch (error) {
        expect(error.statusCode).toBe(403)
        expect(error.data.code).toBe('BOT_DETECTED')
      }
    })

    it('should block node-fetch user agent', async () => {
      const handler = registerEndpoint('/api/test-nodefetch', defineEventHandler(blockBotsMiddleware))
      
      try {
        await $fetch('/api/test-nodefetch', {
          headers: {
            'user-agent': 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)'
          }
        })
        expect.fail('Request should have been blocked')
      } catch (error) {
        expect(error.statusCode).toBe(403)
        expect(error.data.code).toBe('BOT_DETECTED')
      }
    })

    it('should be case-insensitive when detecting bots', async () => {
      const handler = registerEndpoint('/api/test-case', defineEventHandler(blockBotsMiddleware))
      
      try {
        await $fetch('/api/test-case', {
          headers: {
            'user-agent': 'Mozilla/5.0 PUPPETEER Test'
          }
        })
        expect.fail('Request should have been blocked')
      } catch (error) {
        expect(error.statusCode).toBe(403)
        expect(error.data.code).toBe('BOT_DETECTED')
      }
    })
  })

  describe('Allowed paths bypass detection', () => {
    it('should allow robots.txt even with bot user agent', async () => {
      const handler = registerEndpoint('/robots.txt', defineEventHandler(blockBotsMiddleware))
      
      const response = await $fetch('/robots.txt', {
        headers: {
          'user-agent': 'curl/7.68.0'
        }
      })
      
      expect(response).toBeUndefined()
    })

    it('should allow sitemap.xml even with bot user agent', async () => {
      const handler = registerEndpoint('/sitemap.xml', defineEventHandler(blockBotsMiddleware))
      
      const response = await $fetch('/sitemap.xml', {
        headers: {
          'user-agent': 'python-requests/2.31.0'
        }
      })
      
      expect(response).toBeUndefined()
    })

    it('should allow .well-known paths even with bot user agent', async () => {
      const handler = registerEndpoint('/.well-known/security.txt', defineEventHandler(blockBotsMiddleware))
      
      const response = await $fetch('/.well-known/security.txt', {
        headers: {
          'user-agent': 'HeadlessChrome/120.0.0.0'
        }
      })
      
      expect(response).toBeUndefined()
    })

    it('should allow __sitemap__ paths even with bot user agent', async () => {
      const handler = registerEndpoint('/__sitemap__/urls', defineEventHandler(blockBotsMiddleware))
      
      const response = await $fetch('/__sitemap__/urls', {
        headers: {
          'user-agent': 'SomeBot/1.0'
        }
      })
      
      expect(response).toBeUndefined()
    })
  })

  describe('Edge cases - missing user agent', () => {
    it('should allow requests with no user agent header', async () => {
      const handler = registerEndpoint('/api/test-no-ua', defineEventHandler(blockBotsMiddleware))
      
      const response = await $fetch('/api/test-no-ua', {
        headers: {
          'accept-language': 'en-US'
        }
      })
      
      expect(response).toBeUndefined()
    })

    it('should allow requests with empty user agent', async () => {
      const handler = registerEndpoint('/api/test-empty-ua', defineEventHandler(blockBotsMiddleware))
      
      const response = await $fetch('/api/test-empty-ua', {
        headers: {
          'user-agent': '',
          'accept-language': 'en-US'
        }
      })
      
      expect(response).toBeUndefined()
    })
  })

  describe('Suspicious request patterns', () => {
    it('should block requests with user agent but no accept-language or referer', async () => {
      const handler = registerEndpoint('/api/test-suspicious', defineEventHandler(blockBotsMiddleware))
      
      try {
        await $fetch('/api/test-suspicious', {
          headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        expect.fail('Request should have been blocked')
      } catch (error) {
        expect(error.statusCode).toBe(403)
        expect(error.data.code).toBe('SUSPICIOUS_REQUEST')
        expect(error.data.message).toBe('Suspicious request pattern detected')
      }
    })

    it('should allow requests with user agent and accept-language but no referer', async () => {
      const handler = registerEndpoint('/api/test-with-lang', defineEventHandler(blockBotsMiddleware))
      
      const response = await $fetch('/api/test-with-lang', {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'accept-language': 'en-US,en;q=0.9'
        }
      })
      
      expect(response).toBeUndefined()
    })

    it('should allow requests with user agent and referer but no accept-language', async () => {
      const handler = registerEndpoint('/api/test-with-referer', defineEventHandler(blockBotsMiddleware))
      
      const response = await $fetch('/api/test-with-referer', {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'referer': 'https://example.com'
        }
      })
      
      expect(response).toBeUndefined()
    })

    it('should not block suspicious patterns on allowed paths', async () => {
      const handler = registerEndpoint('/robots.txt', defineEventHandler(blockBotsMiddleware))
      
      const response = await $fetch('/robots.txt', {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      expect(response).toBeUndefined()
    })
  })

  describe('Complex scenarios', () => {
    it('should handle multiple concurrent requests with different user agents', async () => {
      const handler1 = registerEndpoint('/api/concurrent-1', defineEventHandler(blockBotsMiddleware))
      const handler2 = registerEndpoint('/api/concurrent-2', defineEventHandler(blockBotsMiddleware))
      const handler3 = registerEndpoint('/api/concurrent-3', defineEventHandler(blockBotsMiddleware))
      
      const requests = [
        $fetch('/api/concurrent-1', {
          headers: {
            'user-agent': 'Mozilla/5.0 Chrome/120.0.0.0',
            'accept-language': 'en-US'
          }
        }),
        $fetch('/api/concurrent-2', {
          headers: {
            'user-agent': 'curl/7.68.0'
          }
        }).catch(e => e),
        $fetch('/api/concurrent-3', {
          headers: {
            'user-agent': 'Mozilla/5.0 Firefox/119.0',
            'accept-language': 'en-US'
          }
        })
      ]
      
      const results = await Promise.all(requests)
      
      // First request should succeed
      expect(results[0]).toBeUndefined()
      // Second request should be blocked
      expect(results[1].statusCode).toBe(403)
      // Third request should succeed
      expect(results[2]).toBeUndefined()
    })

    it('should properly handle user agents with special characters', async () => {
      const handler = registerEndpoint('/api/test-special', defineEventHandler(blockBotsMiddleware))
      
      const response = await $fetch('/api/test-special', {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
          'accept-language': 'en-US,en;q=0.9'
        }
      })
      
      expect(response).toBeUndefined()
    })
  })
})
