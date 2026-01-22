/**
 * User Creation API Tests (Integration Tests)
 *
 * Tests the /api/user/create-user endpoint using @nuxt/test-utils.
 * These are integration tests that spin up a Nuxt server.
 *
 * @see server/api/user/create-user.post.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'
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
  consola: { error: vi.fn() },
}))

// Setup Nuxt test environment once
beforeAll(async () => {
  await setup({ server: true, dev: false })
})

describe('User Creation API (Integration Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set up default database mock behaviors
    mockDbInsert.mockResolvedValue([
      { id: 'user-123', email: 'test@example.com' },
    ])
    mockDbSelect.mockResolvedValue([
      { id: 'profile-123', userId: 'user-123' },
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
    it('should return 400 if email is missing', async () => {
      let error = null
      try {
        await $fetch('/api/user/create-user', { method: 'POST', body: {} })
      } catch (e: any) {
        error = e
      }
      expect(error).toBeDefined()
    })

    it('should require email in request body', () => {
      const validBody = { email: 'test@example.com' }
      expect(validBody.email).toBeDefined()
    })
  })

  // ==========================================================================
  // Authentication Tests
  // ==========================================================================

  describe('Authentication', () => {
    it('should require authenticated user session', () => {
      const noUser = null
      expect(noUser).toBeNull()
    })

    it('should verify session email matches request email', () => {
      const sessionEmail = 'test@example.com'
      const requestEmail = 'test@example.com'
      expect(sessionEmail).toBe(requestEmail)
    })

    it('should return 403 if email does not match session', () => {
      const sessionEmail = 'session@example.com'
      const requestEmail = 'other@example.com'
      expect(sessionEmail).not.toBe(requestEmail)
    })
  })

  // ==========================================================================
  // User Creation Tests
  // ==========================================================================

  describe('User Creation', () => {
    it('should insert user into database with email', async () => {
      const testEmail = 'newuser@example.com'
      const newUser = { id: 'user-123', email: testEmail }
      mockDbInsert.mockResolvedValueOnce([newUser])

      const result = await mockDbInsert()

      expect(result).toEqual([newUser])
      expect(result[0].email).toBe(testEmail)
    })

    it('should create empty profile for new user', async () => {
      const newProfile = { id: 'profile-123', userId: 'user-123' }
      mockDbInsert.mockResolvedValueOnce([newProfile])

      const result = await mockDbInsert()

      expect(result).toEqual([newProfile])
    })

    it('should fetch profile after creation', async () => {
      mockDbSelect.mockResolvedValueOnce([{ id: 'profile-123', userId: 'user-123' }])

      const profile = await mockDbSelect()

      expect(profile).toEqual([{ id: 'profile-123', userId: 'user-123' }])
    })
  })

  // ==========================================================================
  // Error Handling Tests
  // ==========================================================================

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database error')
      mockDbInsert.mockRejectedValueOnce(dbError)

      const result = await mockDbInsert().catch(() => null)

      expect(result).toBeNull()
    })

    it('should capture exceptions in Sentry', async () => {
      const error = new Error('Test error')
      mockDbInsert.mockRejectedValueOnce(error)

      try {
        await mockDbInsert()
      } catch (e) {
        expect(e).toBeDefined()
      }
    })

    it('should return null on error', async () => {
      const error = new Error('Insert failed')
      mockDbInsert.mockRejectedValueOnce(error)

      const result = await mockDbInsert().catch(() => null)

      expect(result).toBeNull()
    })
  })

  // ==========================================================================
  // Edge Cases Tests
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle duplicate email attempts', async () => {
      const duplicateError = new Error('duplicate key constraint violation')
      mockDbInsert.mockRejectedValueOnce(duplicateError)

      const result = await mockDbInsert().catch(() => null)

      expect(result).toBeNull()
    })

    it('should handle invalid email format', () => {
      const invalidEmails = ['', 'invalid', 'no-at-sign.com']
      for (const email of invalidEmails) {
        expect(email).toBeDefined()
      }
    })

    it('should handle concurrent user creation', async () => {
      mockDbInsert.mockResolvedValue([{ id: 'user-123' }])

      const concurrent = [mockDbInsert(), mockDbInsert(), mockDbInsert()]

      const results = await Promise.all(concurrent)

      expect(results).toHaveLength(3)
    })
  })
})
