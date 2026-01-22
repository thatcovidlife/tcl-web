/**
 * Shared API Testing Utilities
 *
 * Common mocks and utilities for testing Nitro event handlers without
 * spinning up a full Nuxt server (which is slow).
 */

import { vi } from 'vitest'
import type { H3Event } from 'h3'

// =============================================================================
// Database Mocks
// =============================================================================

export const mockDbInsert = vi.fn()
export const mockDbSelect = vi.fn()
export const mockDbUpdate = vi.fn()
export const mockDbDelete = vi.fn()
export const mockDbValues = vi.fn()
export const mockDbReturning = vi.fn()

// Create chainable mock builders
const createChainableMock = (finalMock: ReturnType<typeof vi.fn>) => ({
  values: mockDbValues.mockReturnValue({ returning: mockDbReturning.mockResolvedValue(finalMock) }),
})

const createWhereMock = (finalMock: ReturnType<typeof vi.fn>) => ({
  limit: vi.fn(() => finalMock),
})

const createFromMock = (finalMock: ReturnType<typeof vi.fn>) => ({
  where: createWhereMock(finalMock),
  innerJoin: vi.fn(() => ({ where: createWhereMock(finalMock) })),
  leftJoin: vi.fn(() => ({ where: createWhereMock(finalMock) })),
})

export const mockDb = {
  insert: vi.fn(() => createChainableMock(mockDbInsert)),
  select: vi.fn(() => createFromMock(mockDbSelect)),
  update: vi.fn(() => ({
    set: vi.fn(() => ({ where: vi.fn(() => ({ returning: mockDbUpdate })) })),
  })),
  delete: vi.fn(() => ({
    where: vi.fn(() => ({ returning: mockDbDelete })),
  })),
}

// =============================================================================
// Sentry Mocks
// =============================================================================

export const mockCaptureException = vi.fn()
export const mockCaptureMessage = vi.fn()
export const mockStartSpan = vi.fn((config: any, fn: () => any) => fn())

export const mockSentry = {
  captureException: mockCaptureException,
  captureMessage: mockCaptureMessage,
  startSpan: mockStartSpan,
}

// =============================================================================
// Session Mocks
// =============================================================================

export const createMockUser = (email: string, userId: string) => ({
  sub: userId,
  email,
  name: 'Test User',
  picture: '',
})

export const createMockSession = (email: string, userId: string) => ({
  user: createMockUser(email, userId),
})

export const mockGetUserSession = vi.fn()

// =============================================================================
// Event Handler Mocks
// =============================================================================

export const createMockEvent = (overrides: Partial<H3Event> = {}): H3Event => {
  return {
    node: {
      req: { headers: {} },
      res: { statusCode: 200, headers: {} },
    },
    context: {},
    ...overrides,
  } as H3Event
}

export const createMockEventWithBody = <T = any>(body: T, sessionUser?: any) => {
  const event = createMockEvent()
  ;(event as any)._body = body
  ;(event as any)._session = sessionUser ? { user: sessionUser } : undefined
  return event
}

// =============================================================================
// Consola Mocks
// =============================================================================

export const mockConsola = {
  success: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
  debug: vi.fn(),
}

// =============================================================================
// AI SDK Mocks
// =============================================================================

export const mockStreamText = vi.fn()
export const mockCreateUIMessageStream = vi.fn()
export const mockCreateUIMessageStreamResponse = vi.fn()
export const mockConvertToModelMessages = vi.fn((msg: any) => msg)

export const mockStream = {
  toUIMessageStream: vi.fn(() => mockStream),
  pipeThrough: vi.fn(() => mockStream),
}

// =============================================================================
// Chat/API Specific Mocks
// =============================================================================

export const mockLimit = vi.fn()
export const mockFetchPrompt = vi.fn()
export const mockGuardText = vi.fn()
export const mockGenerateText = vi.fn()
export const mockEmbed = vi.fn()
export const mockQdrantSearch = vi.fn()

export const mockRatelimit = {
  limit: mockLimit,
}

export const mockChatConfig = {
  llmTemperature: 0.7,
  llmMaxTokens: 1000,
}

export const mockModel = {
  languageModel: vi.fn(() => 'mock-model'),
}

// =============================================================================
// Test Fixtures
// =============================================================================

export const mockChat = {
  id: 'chat-123',
  userId: 'user-123',
  title: 'Test Chat',
  createdAt: new Date('2024-01-01'),
}

export const mockMessage = {
  id: 'msg-123',
  chatId: 'chat-123',
  content: 'Test message',
  role: 'user',
  parts: [],
  createdAt: new Date('2024-01-01'),
}

export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  role: 'USER',
  active: true,
}

export const mockProfile = {
  id: 'profile-123',
  userId: 'user-123',
  name: 'Test User',
  bio: 'Test bio',
  website: '',
  language: 'en',
  theme: 'light',
}

// =============================================================================
// Mock Setup Helper
// =============================================================================

/**
 * Sets up all common mocks for API testing.
 * Call this in beforeEach() to reset mocks to default behavior.
 */
export function setupCommonMocks() {
  // Reset all mocks
  mockDbInsert.mockReset()
  mockDbSelect.mockReset()
  mockDbUpdate.mockReset()
  mockDbDelete.mockReset()
  mockCaptureException.mockReset()
  mockCaptureMessage.mockReset()
  mockStartSpan.mockReset()
  mockGetUserSession.mockReset()
  mockLimit.mockReset()
  mockFetchPrompt.mockReset()
  mockStreamText.mockReset()
  mockCreateUIMessageStream.mockReset()
  mockGuardText.mockReset()
  mockGenerateText.mockReset()
  mockEmbed.mockReset()
  mockQdrantSearch.mockReset()

  // Set up default successful behaviors
  mockDbSelect.mockResolvedValue([mockUser])
  mockDbInsert.mockResolvedValue([mockUser])
  mockDbUpdate.mockResolvedValue([mockProfile])
  mockLimit.mockResolvedValue({ success: true, remaining: 95 })
  mockFetchPrompt.mockResolvedValue('You are a helpful assistant.')
  mockStreamText.mockReturnValue({ toUIMessageStream: vi.fn(() => mockStream) })
  mockCreateUIMessageStream.mockImplementation(({ execute }: any) => {
    execute({ writer: { merge: vi.fn() } })
    return mockStream
  })
  mockGenerateText.mockResolvedValue({
    text: 'SAFE',
    steps: [{ content: [{ type: 'text', text: 'SAFE' }] }],
  })
  mockEmbed.mockResolvedValue({ embedding: [0.1, 0.2, 0.3] })
  mockQdrantSearch.mockResolvedValue([])
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Creates a mock error with statusCode for testing error responses
 */
export const createMockError = (status: number, message: string) => {
  const error: any = new Error(message)
  error.statusCode = status
  error.statusMessage = message
  error.message = message
  return error
}

/**
 * Cleans up console spies after tests
 */
export function cleanupConsoleSpies() {
  const consoleLog = console.log as any
  const consoleError = console.error as any
  const consoleWarn = console.warn as any
  if (consoleLog?.mockRestore) consoleLog.mockRestore()
  if (consoleError?.mockRestore) consoleError.mockRestore()
  if (consoleWarn?.mockRestore) consoleWarn.mockRestore()
}
