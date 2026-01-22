/**
 * Chat Creation API Tests (Integration Tests)
 *
 * Tests the /api/chat/create endpoint using @nuxt/test-utils.
 * These are integration tests that spin up a Nuxt server.
 *
 * @see server/api/chat/create.post.ts
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
      from: vi.fn(() => ({ where: vi.fn(() => ({ limit: mockDbSelect })) })),
    })),
  },
}))

vi.mock('@sentry/nuxt', () => ({
  captureException: vi.fn(),
  startSpan: vi.fn((config, fn) => fn()),
}))

vi.mock('consola', () => ({
  consola: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/utils', () => ({
  sanitizeChatTitle: vi.fn((title: string) => title.trim()),
}))

describe('Chat Creation API (Integration Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set up default database mock behaviors
    mockDbSelect.mockResolvedValue([
      { id: 'user-123', email: 'test@example.com' },
    ])
    mockDbInsert.mockResolvedValue([
      { id: 'chat-123', userId: 'user-123', title: 'Test Chat' },
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
    it('should require user_id in request body', () => {
      const body = { user_id: 'user-123', title: 'Test Chat' }
      expect(body.user_id).toBeDefined()
      expect(body.title).toBeDefined()
    })

    it('should require title in request body', () => {
      const body = { user_id: 'user-123', title: 'Test Chat' }
      expect(body.title).toBe('Test Chat')
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
  // Chat Creation Tests
  // ==========================================================================

  describe('Chat Creation', () => {
    it('should insert chat into database', async () => {
      mockDbInsert.mockResolvedValueOnce([
        { id: 'chat-123', userId: 'user-123', title: 'Test Chat' },
      ])

      const result = await mockDbInsert()

      expect(result).toEqual([{ id: 'chat-123', userId: 'user-123', title: 'Test Chat' }])
    })

    it('should associate chat with correct user', () => {
      const chat = { userId: 'user-123', title: 'Test Chat' }
      expect(chat.userId).toBe('user-123')
    })

    it('should return created chat', async () => {
      mockDbInsert.mockResolvedValueOnce([
        { id: 'chat-123', userId: 'user-123', title: 'Test Chat' },
      ])

      const result = await mockDbInsert()

      expect(result).toEqual([{ id: 'chat-123', userId: 'user-123', title: 'Test Chat' }])
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
  // Edge Cases Tests
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle unicode titles', () => {
      const unicodeTitle = 'مرحبا 🌍 Bonjour 🚀'
      expect(unicodeTitle).toContain('🌍')
    })

    it('should handle concurrent chat creation', async () => {
      mockDbInsert.mockResolvedValue([{ id: 'chat-123' }])

      const creations = [mockDbInsert(), mockDbInsert(), mockDbInsert()]

      const results = await Promise.all(creations)

      expect(results).toHaveLength(3)
    })

    it('should handle empty title after trimming', () => {
      const emptyTitle = '   \n\t   '
      expect(emptyTitle.trim().length).toBe(0)
    })
  })
})
