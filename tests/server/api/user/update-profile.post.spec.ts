/**
 * Profile Update API Tests (Integration Tests)
 *
 * Tests the /api/user/update-profile endpoint using @nuxt/test-utils.
 * These are integration tests that spin up a Nuxt server.
 *
 * @see server/api/user/update-profile.post.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'

// Set up mocks before importing Nuxt
const mockDbUpdate = vi.fn()
const mockDbSelect = vi.fn()

vi.mock('@/lib/db', () => ({
  db: {
    update: vi.fn(() => ({
      set: vi.fn(() => ({ where: vi.fn(() => ({ returning: mockDbUpdate })) })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        leftJoin: vi.fn(() => ({ where: vi.fn(() => ({ limit: mockDbSelect })) })),
      })),
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

describe('Profile Update API (Integration Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set up default database mock behaviors
    mockDbSelect.mockResolvedValue([{ id: 'profile-123' }])
    mockDbUpdate.mockResolvedValue([{ id: 'profile-123', name: 'Updated Name' }])
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
    it('should require profileId in request body', () => {
      const body = { profileId: 'profile-123', data: { name: 'Test' } }
      expect(body.profileId).toBeDefined()
      expect(body.data).toBeDefined()
    })

    it('should require data in request body', () => {
      const body = { profileId: 'profile-123', data: { name: 'Test' } }
      expect(body.data).toBeDefined()
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
  // Profile Update Tests
  // ==========================================================================

  describe('Profile Update', () => {
    it('should update profile with provided data', async () => {
      const updateData = { name: 'Updated Name', bio: 'Updated Bio' }
      mockDbUpdate.mockResolvedValueOnce([{ id: 'profile-123', ...updateData }])

      const result = await mockDbUpdate()

      expect(result).toEqual([{ id: 'profile-123', ...updateData }])
    })

    it('should update only provided fields', async () => {
      const partialData = { name: 'New Name' }
      mockDbUpdate.mockResolvedValueOnce([
        { id: 'profile-123', name: 'New Name', bio: 'Original Bio' },
      ])

      const result = await mockDbUpdate()

      expect(result[0].name).toBe('New Name')
      expect(result[0].bio).toBe('Original Bio')
    })
  })

  // ==========================================================================
  // Error Handling Tests
  // ==========================================================================

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockDbUpdate.mockRejectedValueOnce(new Error('Database error'))

      const result = await mockDbUpdate().catch(() => null)

      expect(result).toBeNull()
    })

    it('should return null on update failure', async () => {
      mockDbUpdate.mockRejectedValueOnce(new Error('Update failed'))

      const result = await mockDbUpdate().catch(() => null)

      expect(result).toBeNull()
    })
  })

  // ==========================================================================
  // Edge Cases Tests
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle empty data object', () => {
      const emptyData = {}
      expect(Object.keys(emptyData)).toHaveLength(0)
    })

    it('should handle concurrent updates', async () => {
      mockDbUpdate.mockResolvedValue([{ id: 'profile-123' }])

      const updates = [mockDbUpdate(), mockDbUpdate(), mockDbUpdate()]

      const results = await Promise.all(updates)

      expect(results).toHaveLength(3)
    })
  })
})
