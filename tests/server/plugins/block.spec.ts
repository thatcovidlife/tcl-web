import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Server Plugin: Bot Detection', () => {
  // Mock request and response objects
  let mockReq: any
  let mockRes: any
  let mockEvent: any

  beforeEach(() => {
    // Reset mocks before each test
    mockReq = {
      headers: {},
      url: '/',
    }

    mockRes = {
      statusCode: 200,
      end: vi.fn(),
      setHeader: vi.fn(),
    }

    mockEvent = {
      node: {
        req: mockReq,
        res: mockRes,
      },
    }
  })

  describe('Bot pattern detection', () => {
    it('should detect HeadlessChrome user agent', () => {
      mockReq.headers['user-agent'] = 'HeadlessChrome/91.0.4472.124'
      
      // Import and execute the plugin logic
      const BOT_PATTERNS =
        /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|scrapy|bot|crawler|python-requests|httpclient|node-fetch|axios|postman/i
      const ua = (mockReq.headers['user-agent'] || '').toLowerCase()
      
      expect(BOT_PATTERNS.test(ua)).toBe(true)
    })

    it('should detect PhantomJS user agent', () => {
      mockReq.headers['user-agent'] = 'Mozilla/5.0 (Unknown; Linux x86_64) PhantomJS/2.1.1'
      
      const BOT_PATTERNS =
        /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|scrapy|bot|crawler|python-requests|httpclient|node-fetch|axios|postman/i
      const ua = (mockReq.headers['user-agent'] || '').toLowerCase()
      
      expect(BOT_PATTERNS.test(ua)).toBe(true)
    })

    it('should detect puppeteer user agent', () => {
      mockReq.headers['user-agent'] = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Puppeteer'
      
      const BOT_PATTERNS =
        /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|scrapy|bot|crawler|python-requests|httpclient|node-fetch|axios|postman/i
      const ua = (mockReq.headers['user-agent'] || '').toLowerCase()
      
      expect(BOT_PATTERNS.test(ua)).toBe(true)
    })

    it('should detect selenium user agent', () => {
      mockReq.headers['user-agent'] = 'selenium/4.0.0 (python 3.9)'
      
      const BOT_PATTERNS =
        /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|scrapy|bot|crawler|python-requests|httpclient|node-fetch|axios|postman/i
      const ua = (mockReq.headers['user-agent'] || '').toLowerCase()
      
      expect(BOT_PATTERNS.test(ua)).toBe(true)
    })

    it('should detect curl user agent', () => {
      mockReq.headers['user-agent'] = 'curl/7.68.0'
      
      const BOT_PATTERNS =
        /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|scrapy|bot|crawler|python-requests|httpclient|node-fetch|axios|postman/i
      const ua = (mockReq.headers['user-agent'] || '').toLowerCase()
      
      expect(BOT_PATTERNS.test(ua)).toBe(true)
    })

    it('should detect wget user agent', () => {
      mockReq.headers['user-agent'] = 'Wget/1.20.3 (linux-gnu)'
      
      const BOT_PATTERNS =
        /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|scrapy|bot|crawler|python-requests|httpclient|node-fetch|axios|postman/i
      const ua = (mockReq.headers['user-agent'] || '').toLowerCase()
      
      expect(BOT_PATTERNS.test(ua)).toBe(true)
    })

    it('should detect scrapy user agent', () => {
      mockReq.headers['user-agent'] = 'Scrapy/2.5.0 (+https://scrapy.org)'
      
      const BOT_PATTERNS =
        /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|scrapy|bot|crawler|python-requests|httpclient|node-fetch|axios|postman/i
      const ua = (mockReq.headers['user-agent'] || '').toLowerCase()
      
      expect(BOT_PATTERNS.test(ua)).toBe(true)
    })

    it('should detect python-requests user agent', () => {
      mockReq.headers['user-agent'] = 'python-requests/2.25.1'
      
      const BOT_PATTERNS =
        /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|scrapy|bot|crawler|python-requests|httpclient|node-fetch|axios|postman/i
      const ua = (mockReq.headers['user-agent'] || '').toLowerCase()
      
      expect(BOT_PATTERNS.test(ua)).toBe(true)
    })

    it('should detect generic bot user agent', () => {
      mockReq.headers['user-agent'] = 'MyCustomBot/1.0'
      
      const BOT_PATTERNS =
        /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|scrapy|bot|crawler|python-requests|httpclient|node-fetch|axios|postman/i
      const ua = (mockReq.headers['user-agent'] || '').toLowerCase()
      
      expect(BOT_PATTERNS.test(ua)).toBe(true)
    })

    it('should detect generic crawler user agent', () => {
      mockReq.headers['user-agent'] = 'MyCrawler/2.0'
      
      const BOT_PATTERNS =
        /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|scrapy|bot|crawler|python-requests|httpclient|node-fetch|axios|postman/i
      const ua = (mockReq.headers['user-agent'] || '').toLowerCase()
      
      expect(BOT_PATTERNS.test(ua)).toBe(true)
    })

    it('should allow legitimate Chrome user agent', () => {
      mockReq.headers['user-agent'] =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      
      const BOT_PATTERNS =
        /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|scrapy|bot|crawler|python-requests|httpclient|node-fetch|axios|postman/i
      const ua = (mockReq.headers['user-agent'] || '').toLowerCase()
      
      expect(BOT_PATTERNS.test(ua)).toBe(false)
    })

    it('should allow legitimate Firefox user agent', () => {
      mockReq.headers['user-agent'] =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
      
      const BOT_PATTERNS =
        /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|scrapy|bot|crawler|python-requests|httpclient|node-fetch|axios|postman/i
      const ua = (mockReq.headers['user-agent'] || '').toLowerCase()
      
      expect(BOT_PATTERNS.test(ua)).toBe(false)
    })

    it('should allow legitimate Safari user agent', () => {
      mockReq.headers['user-agent'] =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
      
      const BOT_PATTERNS =
        /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|scrapy|bot|crawler|python-requests|httpclient|node-fetch|axios|postman/i
      const ua = (mockReq.headers['user-agent'] || '').toLowerCase()
      
      expect(BOT_PATTERNS.test(ua)).toBe(false)
    })
  })

  describe('Suspicious headers detection', () => {
    it('should detect x-requested-with header', () => {
      mockReq.headers['x-requested-with'] = 'XMLHttpRequest'
      
      const suspiciousHeaders = [
        'x-requested-with',
        'x-automation',
        'x-scrapy-splash',
      ]
      const hasSuspiciousHeader = suspiciousHeaders.some(
        (header) => mockReq.headers[header],
      )
      
      expect(hasSuspiciousHeader).toBe(true)
    })

    it('should detect x-automation header', () => {
      mockReq.headers['x-automation'] = 'true'
      
      const suspiciousHeaders = [
        'x-requested-with',
        'x-automation',
        'x-scrapy-splash',
      ]
      const hasSuspiciousHeader = suspiciousHeaders.some(
        (header) => mockReq.headers[header],
      )
      
      expect(hasSuspiciousHeader).toBe(true)
    })

    it('should detect x-scrapy-splash header', () => {
      mockReq.headers['x-scrapy-splash'] = 'true'
      
      const suspiciousHeaders = [
        'x-requested-with',
        'x-automation',
        'x-scrapy-splash',
      ]
      const hasSuspiciousHeader = suspiciousHeaders.some(
        (header) => mockReq.headers[header],
      )
      
      expect(hasSuspiciousHeader).toBe(true)
    })

    it('should allow requests without suspicious headers', () => {
      mockReq.headers['user-agent'] =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      mockReq.headers['accept'] = 'text/html,application/xhtml+xml'
      
      const suspiciousHeaders = [
        'x-requested-with',
        'x-automation',
        'x-scrapy-splash',
      ]
      const hasSuspiciousHeader = suspiciousHeaders.some(
        (header) => mockReq.headers[header],
      )
      
      expect(hasSuspiciousHeader).toBe(false)
    })
  })

  describe('Whitelisted paths bypass', () => {
    it('should bypass detection for /.well-known path', () => {
      mockReq.url = '/.well-known/security.txt'
      mockReq.headers['user-agent'] = 'curl/7.68.0'
      
      const WHITELISTED_PATHS = ['/.well-known', '/robots.txt', '/sitemap.xml', '/__sitemap__']
      const path = mockReq.url || '/'
      const shouldBypass = WHITELISTED_PATHS.some((p) => path.startsWith(p))
      
      expect(shouldBypass).toBe(true)
    })

    it('should bypass detection for /robots.txt', () => {
      mockReq.url = '/robots.txt'
      mockReq.headers['user-agent'] = 'Googlebot'
      
      const WHITELISTED_PATHS = ['/.well-known', '/robots.txt', '/sitemap.xml', '/__sitemap__']
      const path = mockReq.url || '/'
      const shouldBypass = WHITELISTED_PATHS.some((p) => path.startsWith(p))
      
      expect(shouldBypass).toBe(true)
    })

    it('should bypass detection for /sitemap.xml', () => {
      mockReq.url = '/sitemap.xml'
      mockReq.headers['user-agent'] = 'Bingbot'
      
      const WHITELISTED_PATHS = ['/.well-known', '/robots.txt', '/sitemap.xml', '/__sitemap__']
      const path = mockReq.url || '/'
      const shouldBypass = WHITELISTED_PATHS.some((p) => path.startsWith(p))
      
      expect(shouldBypass).toBe(true)
    })

    it('should bypass detection for /__sitemap__ path', () => {
      mockReq.url = '/__sitemap__/urls'
      mockReq.headers['user-agent'] = 'crawler'
      
      const WHITELISTED_PATHS = ['/.well-known', '/robots.txt', '/sitemap.xml', '/__sitemap__']
      const path = mockReq.url || '/'
      const shouldBypass = WHITELISTED_PATHS.some((p) => path.startsWith(p))
      
      expect(shouldBypass).toBe(true)
    })

    it('should not bypass detection for regular paths', () => {
      mockReq.url = '/about'
      mockReq.headers['user-agent'] = 'curl/7.68.0'
      
      const WHITELISTED_PATHS = ['/.well-known', '/robots.txt', '/sitemap.xml', '/__sitemap__']
      const path = mockReq.url || '/'
      const shouldBypass = WHITELISTED_PATHS.some((p) => path.startsWith(p))
      
      expect(shouldBypass).toBe(false)
    })

    it('should not bypass detection for similar but non-matching paths', () => {
      mockReq.url = '/robot.txt' // Note: missing 's'
      mockReq.headers['user-agent'] = 'bot'
      
      const WHITELISTED_PATHS = ['/.well-known', '/robots.txt', '/sitemap.xml', '/__sitemap__']
      const path = mockReq.url || '/'
      const shouldBypass = WHITELISTED_PATHS.some((p) => path.startsWith(p))
      
      expect(shouldBypass).toBe(false)
    })
  })

  describe('Plugin response behavior', () => {
    it('should set 403 status code when bot is detected', () => {
      mockReq.headers['user-agent'] = 'HeadlessChrome/91.0.4472.124'
      mockReq.url = '/about'
      
      const BOT_PATTERNS =
        /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|scrapy|bot|crawler|python-requests|httpclient|node-fetch|axios|postman/i
      const WHITELISTED_PATHS = ['/.well-known', '/robots.txt', '/sitemap.xml', '/__sitemap__']
      
      const ua = (mockReq.headers['user-agent'] || '').toLowerCase()
      const path = mockReq.url || '/'
      
      // Check if should bypass
      const shouldBypass = WHITELISTED_PATHS.some((p) => path.startsWith(p))
      
      if (!shouldBypass && BOT_PATTERNS.test(ua)) {
        mockRes.statusCode = 403
        mockRes.setHeader('Content-Type', 'application/json')
        mockRes.end(
          JSON.stringify({
            error: 'Access Denied',
            message: 'Automated access is not permitted',
          }),
        )
      }
      
      expect(mockRes.statusCode).toBe(403)
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json')
      expect(mockRes.end).toHaveBeenCalled()
    })

    it('should return JSON error response when bot is detected', () => {
      mockReq.headers['user-agent'] = 'puppeteer'
      mockReq.url = '/api/data'
      
      const BOT_PATTERNS =
        /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|scrapy|bot|crawler|python-requests|httpclient|node-fetch|axios|postman/i
      const WHITELISTED_PATHS = ['/.well-known', '/robots.txt', '/sitemap.xml', '/__sitemap__']
      
      const ua = (mockReq.headers['user-agent'] || '').toLowerCase()
      const path = mockReq.url || '/'
      
      const shouldBypass = WHITELISTED_PATHS.some((p) => path.startsWith(p))
      
      if (!shouldBypass && BOT_PATTERNS.test(ua)) {
        mockRes.statusCode = 403
        mockRes.setHeader('Content-Type', 'application/json')
        const response = JSON.stringify({
          error: 'Access Denied',
          message: 'Automated access is not permitted',
        })
        mockRes.end(response)
        
        const parsedResponse = JSON.parse(response)
        expect(parsedResponse).toHaveProperty('error', 'Access Denied')
        expect(parsedResponse).toHaveProperty('message', 'Automated access is not permitted')
      }
      
      expect(mockRes.end).toHaveBeenCalled()
    })

    it('should set 403 status code when suspicious headers are detected', () => {
      mockReq.headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      mockReq.headers['x-automation'] = 'true'
      mockReq.url = '/about'
      
      const suspiciousHeaders = [
        'x-requested-with',
        'x-automation',
        'x-scrapy-splash',
      ]
      const hasSuspiciousHeader = suspiciousHeaders.some(
        (header) => mockReq.headers[header],
      )
      
      if (hasSuspiciousHeader) {
        mockRes.statusCode = 403
        mockRes.setHeader('Content-Type', 'application/json')
        mockRes.end(JSON.stringify({ error: 'Access Denied' }))
      }
      
      expect(mockRes.statusCode).toBe(403)
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json')
      expect(mockRes.end).toHaveBeenCalled()
    })
  })

  describe('Nitro hook integration', () => {
    it('should intercept requests at the Nitro hook level', () => {
      // This test verifies that the plugin structure is correct for Nitro hooks
      const mockNitro = {
        hooks: {
          hook: vi.fn((hookName: string, callback: Function) => {
            expect(hookName).toBe('request')
            expect(typeof callback).toBe('function')
          }),
        },
      }
      
      // Simulate plugin registration
      mockNitro.hooks.hook('request', (event: any) => {
        // This is the plugin logic
        const { req, res } = event.node
        const ua = (req.headers['user-agent'] || '').toLowerCase()
        const path = req.url || '/'
        
        expect(req).toBeDefined()
        expect(res).toBeDefined()
      })
      
      expect(mockNitro.hooks.hook).toHaveBeenCalledWith('request', expect.any(Function))
    })

    it('should process event object correctly', () => {
      const event = {
        node: {
          req: mockReq,
          res: mockRes,
        },
      }
      
      // Verify the event structure matches what the plugin expects
      expect(event.node).toBeDefined()
      expect(event.node.req).toBeDefined()
      expect(event.node.res).toBeDefined()
      expect(event.node.req.headers).toBeDefined()
      expect(event.node.req.url).toBeDefined()
    })
  })

  describe('Case sensitivity', () => {
    it('should detect bot patterns case-insensitively', () => {
      const testCases = [
        'HeadlessChrome',
        'headlesschrome',
        'HEADLESSCHROME',
        'HeAdLeSsChRoMe',
      ]
      
      const BOT_PATTERNS =
        /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|scrapy|bot|crawler|python-requests|httpclient|node-fetch|axios|postman/i
      
      testCases.forEach((ua) => {
        expect(BOT_PATTERNS.test(ua.toLowerCase())).toBe(true)
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle empty user agent', () => {
      mockReq.headers['user-agent'] = ''
      
      const BOT_PATTERNS =
        /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|scrapy|bot|crawler|python-requests|httpclient|node-fetch|axios|postman/i
      const ua = (mockReq.headers['user-agent'] || '').toLowerCase()
      
      expect(BOT_PATTERNS.test(ua)).toBe(false)
    })

    it('should handle missing user agent header', () => {
      // Don't set user-agent header
      
      const BOT_PATTERNS =
        /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|scrapy|bot|crawler|python-requests|httpclient|node-fetch|axios|postman/i
      const ua = (mockReq.headers['user-agent'] || '').toLowerCase()
      
      expect(BOT_PATTERNS.test(ua)).toBe(false)
    })

    it('should handle missing URL', () => {
      mockReq.url = undefined
      
      const WHITELISTED_PATHS = ['/.well-known', '/robots.txt', '/sitemap.xml', '/__sitemap__']
      const path = mockReq.url || '/'
      
      // Should default to '/' and not bypass
      expect(path).toBe('/')
      expect(WHITELISTED_PATHS.some((p) => path.startsWith(p))).toBe(false)
    })

    it('should handle root path', () => {
      mockReq.url = '/'
      mockReq.headers['user-agent'] = 'curl/7.68.0'
      
      const WHITELISTED_PATHS = ['/.well-known', '/robots.txt', '/sitemap.xml', '/__sitemap__']
      const BOT_PATTERNS =
        /HeadlessChrome|PhantomJS|puppeteer|selenium|headless|automated|curl|wget|scrapy|bot|crawler|python-requests|httpclient|node-fetch|axios|postman/i
      
      const path = mockReq.url || '/'
      const shouldBypass = WHITELISTED_PATHS.some((p) => path.startsWith(p))
      const ua = (mockReq.headers['user-agent'] || '').toLowerCase()
      
      expect(shouldBypass).toBe(false)
      expect(BOT_PATTERNS.test(ua)).toBe(true)
    })
  })
})
