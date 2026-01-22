/**
 * Database testing utilities
 * Helper functions for mocking Drizzle ORM and database operations
 */

import { vi } from 'vitest'
import type { eq, and, or, sql } from 'drizzle-orm'

// ============================================================================
// Mock User Session Helpers
// ============================================================================

export interface MockUserSession {
  user: {
    sub: string
    email: string
    name?: string
    picture?: string
  }
  /**
   * The expiration time of the session
   */
  expires?: string
}

/**
 * Create a mock authenticated user session
 */
export const mockUserSession = (
  email: string,
  userId: string,
  name = 'Test User',
): MockUserSession => ({
  user: {
    sub: userId,
    email,
    name,
  },
  expires: new Date(Date.now() + 3600000).toISOString(),
})

/**
 * Create a mock admin user session
 */
export const mockAdminSession = (
  email: string,
  userId: string,
): MockUserSession => ({
  user: {
    sub: userId,
    email,
    name: 'Admin User',
  },
  expires: new Date(Date.now() + 3600000).toISOString(),
})

// ============================================================================
// Mock Data Builders
// ============================================================================

export interface MockUser {
  id: string
  email: string
  role: 'USER' | 'ADMIN'
  active: boolean
  createdAt?: Date
}

export interface MockProfile {
  id: string
  userId: string
  name: string
  bio: string | null
  website: string | null
  language: 'en' | 'es' | 'fr' | 'pt'
  theme: 'light' | 'dark' | 'system'
}

export interface MockChat {
  id: string
  userId: string
  title: string
  createdAt: Date
}

export interface MockMessage {
  id: string
  chatId: string
  messageId: string
  content: string
  role: 'user' | 'assistant'
  parts: unknown[]
}

/**
 * Build a mock user with optional overrides
 */
export const buildMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: 'user-123',
  email: 'test@example.com',
  role: 'USER',
  active: true,
  createdAt: new Date(),
  ...overrides,
})

/**
 * Build a mock profile with optional overrides
 */
export const buildMockProfile = (
  overrides: Partial<MockProfile> = {},
): MockProfile => ({
  id: 'profile-123',
  userId: 'user-123',
  name: 'Test User',
  bio: null,
  website: null,
  language: 'en',
  theme: 'system',
  ...overrides,
})

/**
 * Build a mock chat with optional overrides
 */
export const buildMockChat = (
  overrides: Partial<MockChat> = {},
): MockChat => ({
  id: 'chat-123',
  userId: 'user-123',
  title: 'Test Chat',
  createdAt: new Date(),
  ...overrides,
})

/**
 * Build a mock message with optional overrides
 */
export const buildMockMessage = (
  overrides: Partial<MockMessage> = {},
): MockMessage => ({
  id: 'msg-123',
  chatId: 'chat-123',
  messageId: 'user-msg-123',
  content: 'Test message content',
  role: 'user',
  parts: [],
  ...overrides,
})

// ============================================================================
// Predefined Test Fixtures
// ============================================================================

export const mockUsers = {
  testUser: buildMockUser({
    id: 'user-test-1',
    email: 'test@example.com',
  }),
  adminUser: buildMockUser({
    id: 'user-admin-1',
    email: 'admin@example.com',
    role: 'ADMIN',
  }),
  inactiveUser: buildMockUser({
    id: 'user-inactive-1',
    email: 'inactive@example.com',
    active: false,
  }),
}

export const mockProfiles = {
  testProfile: buildMockProfile({
    id: 'profile-test-1',
    userId: 'user-test-1',
    name: 'Test User',
    bio: 'This is a test user bio',
  }),
  adminProfile: buildMockProfile({
    id: 'profile-admin-1',
    userId: 'user-admin-1',
    name: 'Admin User',
  }),
}

export const mockChats = {
  testChat1: buildMockChat({
    id: 'chat-test-1',
    userId: 'user-test-1',
    title: 'COVID Information',
  }),
  testChat2: buildMockChat({
    id: 'chat-test-2',
    userId: 'user-test-1',
    title: 'Vaccine Questions',
  }),
}

export const mockMessages = {
  userMessage: buildMockMessage({
    id: 'msg-test-1',
    chatId: 'chat-test-1',
    messageId: 'user-msg-1',
    content: 'What is COVID-19?',
    role: 'user',
  }),
  assistantMessage: buildMockMessage({
    id: 'msg-test-2',
    chatId: 'chat-test-1',
    messageId: 'assistant-msg-1',
    content: 'COVID-19 is a disease caused by the SARS-CoV-2 virus.',
    role: 'assistant',
  }),
}

// ============================================================================
// Mock Drizzle Query Helpers
// ============================================================================

/**
 * Mock a successful database query that returns data
 */
export const mockDbQuery = <T>(returnValue: T) => {
  const mockChain = {
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    rightJoin: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    having: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue(returnValue),
    execute: vi.fn().mockResolvedValue(returnValue),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    then: vi.fn().mockResolvedValue(returnValue),
    catch: vi.fn().mockReturnThis(),
  }

  return mockChain
}

/**
 * Mock a database query that throws an error
 */
export const mockDbQueryError = (error: Error) => {
  const mockChain = {
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    returning: vi.fn().mockRejectedValue(error),
    execute: vi.fn().mockRejectedValue(error),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    then: vi.fn().mockRejectedValue(error),
    catch: vi.fn().mockReturnThis(),
  }

  return mockChain
}

// ============================================================================
// Auth-related Mock Helpers
// ============================================================================

/**
 * Mock the getUserSession function from nuxt-auth-utils
 */
export const mockGetUserSession = (session: MockUserSession | null) => {
  vi.mock('nuxt-auth-utils/app', () => ({
    getUserSession: vi.fn().mockResolvedValue(session),
  }))
}

/**
 * Mock the requireUserSession function from nuxt-auth-utils
 */
export const mockRequireUserSession = (session: MockUserSession) => {
  vi.mock('nuxt-auth-utils/app', () => ({
    requireUserSession: vi.fn().mockResolvedValue(session),
    getUserSession: vi.fn().mockResolvedValue(session),
  }))
}

// ============================================================================
// Database Transaction Mock Helpers
// ============================================================================

/**
 * Mock a database transaction
 */
export const mockDbTransaction = async (
  callback: (tx: any) => Promise<any>,
) => {
  const mockTx = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: vi.fn(),
    rollback: vi.fn(),
  }

  return callback(mockTx)
}

// ============================================================================
// Assertion Helpers
// ============================================================================

/**
 * Assert that a database insert was called with specific data
 */
export const expectDbInsert = (
  mockDb: any,
  table: string,
  data: Record<string, unknown>,
) => {
  expect(mockDb.insert).toHaveBeenCalledWith(table)
  expect(mockDb.insert().values).toHaveBeenCalledWith(data)
}

/**
 * Assert that a database update was called with specific data
 */
export const expectDbUpdate = (
  mockDb: any,
  table: string,
  data: Record<string, unknown>,
) => {
  expect(mockDb.update).toHaveBeenCalledWith(table)
  expect(mockDb.update().set).toHaveBeenCalledWith(data)
}

/**
 * Assert that a database query was called with a where clause
 */
export const expectDbWhere = (mockDb: any, condition: any) => {
  expect(mockDb.select).toHaveBeenCalled()
  expect(mockDb.select().where).toHaveBeenCalledWith(condition)
}
