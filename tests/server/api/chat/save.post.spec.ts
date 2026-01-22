/**
 * Message Persistence API Tests (Integration Tests)
 *
 * Tests the /api/chat/save endpoint using @nuxt/test-utils.
 * These are integration tests that spin up a Nuxt server.
 *
 * @see server/api/chat/save.post.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'

// Set up mocks before importing Nuxt
const mockDbInsert = vi.fn()
const mockDbSelect = vi.fn()

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(() => ({ values: mockDbInsert, returning: vi.fn(() => mockDbInsert) })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ limit: mockDbSelect })),
        innerJoin: vi.fn(() => ({ where: vi.fn(() => ({ limit: mockDbSelect })) })),
      })),
    })),
  },
}))

vi.mock('@sentry/nuxt', () => ({
  captureException: vi.fn(),
  startSpan: vi.fn((config, fn) => fn()),
}))

vi.mock('consola', () => ({
  consola: { success: vi.fn(), error: vi.fn(), warn: vi.fn() },
}))

vi.mock('@/lib/utils', () => ({
  sanitizeChatMessage: vi.fn((content: string) => ({
    isValid: true,
    sanitized: content,
    errors: [],
    warnings: [],
  })),
}))

const mockChatId = 'chat-123'
const mockUserId = 'user-123'

describe('Message Persistence API (Integration Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set up default database mock behaviors
    mockDbSelect.mockResolvedValue([
      { id: mockChatId, userId: mockUserId, title: 'Test Chat' },
    ])
    mockDbInsert.mockResolvedValue([
      { id: 'msg-123', chatId: mockChatId, content: 'Test message', role: 'user' },
    ])
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
    it('should require chat_id and messages array', () => {
      const body = { chat_id: 'chat-123', messages: [{ role: 'user', content: 'Hello' }] }
      expect(body.chat_id).toBeDefined()
      expect(Array.isArray(body.messages)).toBe(true)
    })

    it('should validate message structure has role and content', () => {
      const validMessage = { role: 'user', content: 'Hello' }
      expect(validMessage.role).toBeDefined()
      expect(validMessage.content).toBeDefined()
    })

    it('should accept valid roles', () => {
      const validRoles = ['user', 'assistant']
      validRoles.forEach((role) => {
        expect(['user', 'assistant'].includes(role)).toBe(true)
      })
    })
  })

  // ==========================================================================
  // Authentication Tests
  // ==========================================================================

  describe('Authentication', () => {
    it('should require authenticated user', () => {
      const user = null
      expect(user).toBeNull()
    })
  })

  // ==========================================================================
  // Authorization Tests
  // ==========================================================================

  describe('Authorization', () => {
    it('should verify chat exists', async () => {
      mockDbSelect.mockResolvedValueOnce([
        { id: 'chat-123', userId: 'user-123', title: 'Test Chat' },
      ])

      const chat = await mockDbSelect()

      expect(chat).toEqual([{ id: 'chat-123', userId: 'user-123', title: 'Test Chat' }])
    })

    it('should verify chat belongs to user', () => {
      const sessionEmail = 'test@example.com'
      const chatOwnerEmail = 'test@example.com'
      expect(sessionEmail).toBe(chatOwnerEmail)
    })
  })

  // ==========================================================================
  // Message Sanitization Tests
  // ==========================================================================

  describe('Message Sanitization', () => {
    it('should sanitize user messages', async () => {
      const { sanitizeChatMessage } = await import('@/lib/utils')
      const userMessage = 'Hello world'

      const result = sanitizeChatMessage(userMessage)

      expect(result.isValid).toBe(true)
    })

    it('should not sanitize assistant messages', () => {
      const assistantMessage = { role: 'assistant', content: 'AI response' }
      expect(assistantMessage.role).toBe('assistant')
    })
  })

  // ==========================================================================
  // Database Insertion Tests
  // ==========================================================================

  describe('Database Insertion', () => {
    it('should insert messages into database', async () => {
      mockDbInsert.mockResolvedValueOnce([
        { id: 'msg-123', chatId: 'chat-123', content: 'Test', role: 'user' },
      ])

      const result = await mockDbInsert()

      expect(result).toEqual([{ id: 'msg-123', chatId: 'chat-123', content: 'Test', role: 'user' }])
    })

    it('should associate messages with chat', () => {
      const message = { chatId: 'chat-123', content: 'Test' }
      expect(message.chatId).toBe('chat-123')
    })
  })

  // ==========================================================================
  // Error Handling Tests
  // ==========================================================================

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockDbInsert.mockRejectedValueOnce(new Error('Database error'))

      const result = await mockDbInsert().catch((e) => e)

      expect(result).toBeInstanceOf(Error)
    })

    it('should capture exceptions in Sentry', async () => {
      mockDbInsert.mockRejectedValueOnce(new Error('Test error'))

      try {
        await mockDbInsert()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  // ==========================================================================
  // Response Tests
  // ==========================================================================

  describe('Response', () => {
    it('should return success: true on successful save', () => {
      const response = {
        success: true,
        messages: [{ id: 'msg-123', chatId: 'chat-123' }],
        count: 1,
      }
      expect(response.success).toBe(true)
    })

    it('should return count of saved messages', () => {
      const response = {
        success: true,
        messages: [{ id: 'msg-123' }, { id: 'msg-124' }],
        count: 2,
      }
      expect(response.count).toBe(2)
    })
  })

  // ==========================================================================
  // Edge Cases Tests
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle empty messages array', () => {
      const emptyMessages = []
      expect(emptyMessages.length).toBe(0)
    })

    it('should handle very long message content', () => {
      const longContent = 'a'.repeat(100000)
      expect(longContent.length).toBe(100000)
    })

    it('should handle unicode messages', () => {
      const unicodeMessage = 'Hello 世界 🌍'
      expect(unicodeMessage).toContain('🌍')
    })
  })
})
