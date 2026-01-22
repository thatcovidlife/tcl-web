/**
 * Centralized mocks for external services
 * Import these in test files that need to mock external dependencies
 */

import { vi } from 'vitest'

// ============================================================================
// Qdrant Vector DB Mocks
// ============================================================================

export const mockQdrantSearch = vi.fn()
export const mockQdrantUpsert = vi.fn()
export const mockQdrantGetCollection = vi.fn()

vi.mock('@qdrant/js-client-rest', () => ({
  QdrantClient: vi.fn().mockImplementation(() => ({
    search: mockQdrantSearch,
    upsert: mockQdrantUpsert,
    getCollection: mockQdrantGetCollection,
    delete: vi.fn(),
  })),
}))

// ============================================================================
// Upstash Redis Mocks
// ============================================================================

export const mockRedisGet = vi.fn()
export const mockRedisSet = vi.fn()
export const mockRedisIncr = vi.fn()
export const mockRedisExpire = vi.fn()
export const mockRedisLimit = vi.fn()

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => ({
    get: mockRedisGet,
    set: mockRedisSet,
    incr: mockRedisIncr,
    expire: mockRedisExpire,
    del: vi.fn(),
  })),
}))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn().mockImplementation(() => ({
    limit: mockRedisLimit,
    slidingWindow: vi.fn(),
  })),
}))

// ============================================================================
// Pangea AI Guard Mocks
// ============================================================================

export const mockGuardText = vi.fn()
export const mockPangeaAuditLog = vi.fn()

vi.mock('pangea-node-sdk', () => ({
  PangeaConfig: vi.fn(),
  AIGuardService: vi.fn().mockImplementation(() => ({
    guardText: mockGuardText,
    auditLog: mockPangeaAuditLog,
  })),
}))

// ============================================================================
// Sanity CMS Mocks
// ============================================================================

export const mockSanityFetch = vi.fn()
export const mockSanityCreate = vi.fn()
export const mockSanityPatch = vi.fn()
export const mockSanityDelete = vi.fn()

// Sanity is used via @nuxtjs/sanity, so we mock the composables
vi.mock('@nuxtjs/sanity', () => ({
  useSanity: vi.fn(() => ({
    fetch: mockSanityFetch,
    create: mockSanityCreate,
    patch: mockSanityPatch,
    delete: mockSanityDelete,
  })),
}))

// ============================================================================
// DeepInfra LLM Mocks (via AI SDK)
// ============================================================================

export const mockGenerateText = vi.fn()
export const mockStreamText = vi.fn()

vi.mock('ai', () => ({
  generateText: mockGenerateText,
  streamText: mockStreamText,
  createAI: vi.fn(),
}))

// ============================================================================
// DeepInfra Provider Mocks
// ============================================================================

export const mockDeepInfraProvider = vi.fn()

vi.mock('@ai-sdk/deepinfra', () => ({
  deepinfra: mockDeepInfraProvider,
}))

// ============================================================================
// Sentry Mocks
// ============================================================================

export const mockSentryCaptureException = vi.fn()
export const mockSentryCaptureMessage = vi.fn()
export const mockSentrySetUser = vi.fn()
export const mockSentryStartSpan = vi.fn()

vi.mock('@sentry/nuxt', () => ({
  captureException: mockSentryCaptureException,
  captureMessage: mockSentryCaptureMessage,
  setUser: mockSentrySetUser,
  startSpan: mockSentryStartSpan,
}))

// ============================================================================
// Drizzle ORM Mocks
// ============================================================================

export const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  query: vi.fn(),
  execute: vi.fn(),
}

// Helper to create a chained mock for Drizzle queries
export const createMockQueryChain = (returnValue: any = []) => {
  return {
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    rightJoin: vi.fn().mockReturnThis(),
    fullJoin: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    having: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue(returnValue),
    execute: vi.fn().mockResolvedValue(returnValue),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  }
}

// ============================================================================
// Helper functions for resetting mocks
// ============================================================================

/**
 * Reset all external service mocks to their default state
 * Call this in beforeEach() hooks to ensure clean test isolation
 */
export const resetAllMocks = () => {
  // Qdrant
  mockQdrantSearch.mockReset()
  mockQdrantUpsert.mockReset()
  mockQdrantGetCollection.mockReset()

  // Upstash
  mockRedisGet.mockReset()
  mockRedisSet.mockReset()
  mockRedisIncr.mockReset()
  mockRedisExpire.mockReset()
  mockRedisLimit.mockReset()

  // Pangea
  mockGuardText.mockReset()
  mockPangeaAuditLog.mockReset()

  // Sanity
  mockSanityFetch.mockReset()
  mockSanityCreate.mockReset()
  mockSanityPatch.mockReset()
  mockSanityDelete.mockReset()

  // AI SDK
  mockGenerateText.mockReset()
  mockStreamText.mockReset()
  mockDeepInfraProvider.mockReset()

  // Sentry
  mockSentryCaptureException.mockReset()
  mockSentryCaptureMessage.mockReset()
  mockSentrySetUser.mockReset()
  mockSentryStartSpan.mockReset()

  // Drizzle
  mockDb.select.mockReset()
  mockDb.insert.mockReset()
  mockDb.update.mockReset()
  mockDb.delete.mockReset()
  mockDb.query.mockReset()
  mockDb.execute.mockReset()
}

/**
 * Setup default mock behaviors (happy path)
 * Call this in beforeEach() hooks to set up standard mock responses
 */
export const setupDefaultMockBehaviors = () => {
  // Qdrant - return empty search results by default
  mockQdrantSearch.mockResolvedValue([])

  // Upstash - allow rate limit by default
  mockRedisLimit.mockResolvedValue({
    success: true,
    remaining: 95,
    reset: Date.now() + 60000,
  })

  // Pangea - allow content by default
  mockGuardText.mockResolvedValue({
    result: { blocked: false },
  })

  // Sanity - return empty array by default
  mockSanityFetch.mockResolvedValue([])

  // AI SDK - return safe response by default
  mockGenerateText.mockResolvedValue({
    text: 'Test response',
    steps: [{ content: [{ type: 'text', text: 'SAFE' }] }],
  })

  // DeepInfra provider
  mockDeepInfraProvider.mockReturnValue('deepinfra-model')
}
