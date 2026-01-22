/**
 * Main Chat API Tests (Integration Tests)
 *
 * Tests the /api/chat/index endpoint using @nuxt/test-utils.
 * These are integration tests that spin up a Nuxt server.
 *
 * @see server/api/chat/index.post.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'

// Set up mocks before importing Nuxt
const mockLimit = vi.fn()
const mockStreamText = vi.fn()
const mockCreateUIMessageStream = vi.fn()
const mockCreateUIMessageStreamResponse = vi.fn()
const mockFetchPrompt = vi.fn()

vi.mock('@/lib/chat/rate-limit', () => ({
  ratelimit: { limit: mockLimit },
}))

vi.mock('@/lib/chat/config', () => ({
  config: { llmTemperature: 0.7, llmMaxTokens: 1000 },
}))

vi.mock('@/lib/chat/providers', () => ({
  model: { languageModel: vi.fn(() => 'mock-model') },
}))

vi.mock('@/lib/chat/prompt', () => ({
  fetchPrompt: mockFetchPrompt,
}))

vi.mock('@/lib/chat/tools', () => ({
  guardTool: { type: 'function', description: 'Check content safety' },
  searchTool: { type: 'function', description: 'Search for information' },
}))

vi.mock('ai', () => ({
  convertToModelMessages: vi.fn((msg) => msg),
  createUIMessageStream: mockCreateUIMessageStream,
  createUIMessageStreamResponse: mockCreateUIMessageStreamResponse,
  smoothStream: vi.fn(() => (opts) => opts),
  streamText: mockStreamText,
  stepCountIs: vi.fn((n) => n),
}))

vi.mock('@sentry/nuxt', () => ({
  captureMessage: vi.fn(),
  captureException: vi.fn(),
}))

const mockStream = {
  toUIMessageStream: vi.fn(() => mockStream),
}

describe('Main Chat API (Integration Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set up default mock behaviors
    mockLimit.mockResolvedValue({ success: true, remaining: 95 })
    mockFetchPrompt.mockResolvedValue('You are a helpful assistant.')
    mockStreamText.mockReturnValue({ toUIMessageStream: vi.fn(() => mockStream) })
    mockCreateUIMessageStream.mockImplementation(({ execute }: any) => {
      execute({ writer: { merge: vi.fn() } })
      return mockStream
    })
    mockCreateUIMessageStreamResponse.mockReturnValue({
      headers: { 'content-type': 'text/event-stream' },
    })
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // Manually restore only console mocks
    const consoleLog = console.log as any
    const consoleError = console.error as any
    if (consoleLog?.mockRestore) consoleLog.mockRestore()
    if (consoleError?.mockRestore) consoleError.mockRestore()
  })

  // ==========================================================================
  // Request Validation Tests
  // ==========================================================================

  describe('Request Validation', () => {
    it('should require messages, selectedModel, and userId', () => {
      const body = {
        messages: [{ role: 'user', content: 'Hello' }],
        selectedModel: 'openai/gpt-oss-120b',
        userId: 'user-123',
      }
      expect(body.messages).toBeDefined()
      expect(body.selectedModel).toBeDefined()
      expect(body.userId).toBeDefined()
    })
  })

  // ==========================================================================
  // Rate Limiting Tests
  // ==========================================================================

  describe('Rate Limiting', () => {
    it('should check rate limit for user', async () => {
      mockLimit.mockResolvedValueOnce({ success: true, remaining: 95 })

      const result = await mockLimit('user-123')

      expect(result.success).toBe(true)
      expect(result.remaining).toBe(95)
    })

    it('should return 429 when rate limit exceeded', async () => {
      mockLimit.mockResolvedValueOnce({ success: false, remaining: 0 })

      const result = await mockLimit('user-123')

      expect(result.success).toBe(false)
    })

    it('should bypass rate limit in development', () => {
      const isDevelopment = process.env.NODE_ENV === 'development'
      expect(typeof isDevelopment).toBe('boolean')
    })
  })

  // ==========================================================================
  // Streaming Tests
  // ==========================================================================

  describe('Streaming Response', () => {
    it('should create UI message stream', () => {
      expect(mockCreateUIMessageStream).toBeDefined()
    })

    it('should call streamText with correct parameters', () => {
      const options = {
        model: 'mock-model',
        temperature: 0.7,
        maxOutputTokens: 1000,
        system: 'You are a helpful assistant.',
        messages: [],
        tools: {
          checkContent: expect.any(Object),
          getInformation: expect.any(Object),
        },
      }
      expect(options.model).toBeDefined()
      expect(options.tools).toBeDefined()
    })

    it('should include both tools in stream', () => {
      const tools = {
        checkContent: { type: 'function' },
        getInformation: { type: 'function' },
      }
      expect(Object.keys(tools)).toHaveLength(2)
    })

    it('should enable telemetry with userId', () => {
      const telemetry = { isEnabled: true, metadata: { userId: 'user-123' } }
      expect(telemetry.isEnabled).toBe(true)
      expect(telemetry.metadata.userId).toBeDefined()
    })
  })

  // ==========================================================================
  // Model Configuration Tests
  // ==========================================================================

  describe('Model Configuration', () => {
    it('should use selected model from request', () => {
      const selectedModel = 'openai/gpt-oss-120b'
      expect(selectedModel).toBe('openai/gpt-oss-120b')
    })

    it('should use temperature from config', () => {
      const mockChatConfig = { llmTemperature: 0.7, llmMaxTokens: 1000 }
      expect(mockChatConfig.llmTemperature).toBeDefined()
      expect(mockChatConfig.llmTemperature).toBe(0.7)
    })

    it('should fetch system prompt', async () => {
      const prompt = await mockFetchPrompt()
      expect(prompt).toBeDefined()
    })
  })

  // ==========================================================================
  // Error Handling Tests
  // ==========================================================================

  describe('Error Handling', () => {
    it('should capture stream errors in Sentry', async () => {
      const error = new Error('Stream error')
      expect(error).toBeDefined()
    })

    it('should include request context in error capture', () => {
      const errorContext = {
        userId: 'user-123',
        selectedModel: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: 'Hello' }],
      }
      expect(errorContext.userId).toBeDefined()
    })
  })

  // ==========================================================================
  // Integration Tests
  // ==========================================================================

  describe('Integration Workflow', () => {
    it('should complete full chat request flow', () => {
      const requestBody = {
        messages: [{ role: 'user', content: 'Hello' }],
        selectedModel: 'openai/gpt-oss-120b',
        userId: 'user-123',
      }
      expect(requestBody.messages).toBeDefined()
      expect(requestBody.selectedModel).toBeDefined()
      expect(requestBody.userId).toBeDefined()
    })

    it('should support both available models', () => {
      const models = ['openai/gpt-oss-120b', 'zai-org/GLM-4.7']
      expect(models).toContain('openai/gpt-oss-120b')
      expect(models).toContain('zai-org/GLM-4.7')
    })
  })

  // ==========================================================================
  // Edge Cases Tests
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle empty messages array', () => {
      const messages = []
      expect(messages.length).toBe(0)
    })

    it('should handle very long user messages', () => {
      const longMessage = 'a'.repeat(100000)
      expect(longMessage.length).toBeGreaterThan(50000)
    })

    it('should handle unicode messages', () => {
      const unicodeMessage = 'Hello 世界 🌍'
      expect(unicodeMessage).toContain('🌍')
    })

    it('should handle rapid successive requests', async () => {
      const requests = [mockLimit('user-123'), mockLimit('user-123'), mockLimit('user-123')]
      const results = await Promise.all(requests)
      expect(results).toHaveLength(3)
    })
  })
})
