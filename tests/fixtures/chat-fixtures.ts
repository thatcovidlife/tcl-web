/**
 * Chat-related test fixtures
 * Predefined test data for chat, messages, users, and profiles
 */

// ============================================================================
// User Fixtures
// ============================================================================

export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  role: 'USER' as const,
  active: true,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
}

export const mockAdmin = {
  id: 'admin-123',
  email: 'admin@example.com',
  role: 'ADMIN' as const,
  active: true,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
}

export const mockInactiveUser = {
  id: 'inactive-123',
  email: 'inactive@example.com',
  role: 'USER' as const,
  active: false,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
}

// ============================================================================
// Profile Fixtures
// ============================================================================

export const mockProfile = {
  id: 'profile-123',
  userId: 'user-123',
  name: 'Test User',
  bio: 'This is a test user bio',
  website: 'https://example.com',
  language: 'en' as const,
  theme: 'system' as const,
}

export const mockAdminProfile = {
  id: 'profile-admin-123',
  userId: 'admin-123',
  name: 'Admin User',
  bio: null,
  website: null,
  language: 'en' as const,
  theme: 'dark' as const,
}

// ============================================================================
// Chat Fixtures
// ============================================================================

export const mockChat = {
  id: 'chat-123',
  userId: 'user-123',
  title: 'COVID Information',
  createdAt: new Date('2024-01-15T10:30:00.000Z'),
}

export const mockChat2 = {
  id: 'chat-456',
  userId: 'user-123',
  title: 'Vaccine Questions',
  createdAt: new Date('2024-01-16T14:20:00.000Z'),
}

export const mockAdminChat = {
  id: 'chat-789',
  userId: 'admin-123',
  title: 'Admin Discussion',
  createdAt: new Date('2024-01-17T09:00:00.000Z'),
}

// ============================================================================
// Message Fixtures
// ============================================================================

export const mockUserMessage = {
  id: 'msg-123',
  chatId: 'chat-123',
  messageId: 'user-msg-123',
  content: 'What is COVID-19?',
  role: 'user' as const,
  parts: [],
}

export const mockAssistantMessage = {
  id: 'msg-456',
  chatId: 'chat-123',
  messageId: 'assistant-msg-456',
  content: 'COVID-19 is a disease caused by the SARS-CoV-2 virus.',
  role: 'assistant' as const,
  parts: [],
}

export const mockUserMessage2 = {
  id: 'msg-789',
  chatId: 'chat-123',
  messageId: 'user-msg-789',
  content: 'How does it spread?',
  role: 'user' as const,
  parts: [],
}

export const mockAssistantMessage2 = {
  id: 'msg-101112',
  chatId: 'chat-123',
  messageId: 'assistant-msg-101112',
  content: 'COVID-19 spreads through respiratory droplets when an infected person coughs, sneezes, or talks.',
  role: 'assistant' as const,
  parts: [],
}

// ============================================================================
// Like Fixtures
// ============================================================================

export const mockLike = {
  id: 'like-123',
  messageId: 'msg-456',
  userId: 'user-123',
  like: true,
  createdAt: new Date('2024-01-15T10:35:00.000Z'),
}

export const mockDislike = {
  id: 'like-456',
  messageId: 'msg-789',
  userId: 'user-123',
  like: false,
  createdAt: new Date('2024-01-16T14:25:00.000Z'),
}

// ============================================================================
// Session Fixtures
// ============================================================================

export const mockSession = {
  user: {
    sub: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    picture: 'https://example.com/avatar.jpg',
  },
  expires: new Date(Date.now() + 3600000).toISOString(),
}

export const mockAdminSession = {
  user: {
    sub: 'admin-123',
    email: 'admin@example.com',
    name: 'Admin User',
    picture: 'https://example.com/admin-avatar.jpg',
  },
  expires: new Date(Date.now() + 3600000).toISOString(),
}

export const mockExpiredSession = {
  user: {
    sub: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  },
  expires: new Date(Date.now() - 3600000).toISOString(), // Expired
}

// ============================================================================
// Message Parts Fixtures (for tool calls, citations, etc.)
// ============================================================================

export const mockMessageWithToolCall = {
  id: 'msg-with-tool',
  chatId: 'chat-123',
  messageId: 'msg-tool-123',
  content: '',
  role: 'assistant' as const,
  parts: [
    {
      type: 'tool-call',
      toolName: 'search',
      toolArgs: { query: 'COVID-19 symptoms' },
      toolCallId: 'tool-call-123',
    },
  ],
}

export const mockMessageWithCitation = {
  id: 'msg-with-citation',
  chatId: 'chat-123',
  messageId: 'msg-cite-123',
  content: 'According to recent studies...',
  role: 'assistant' as const,
  parts: [
    {
      type: 'citation',
      source: 'WHO',
      url: 'https://who.int/covid-19',
      title: 'COVID-19 Overview',
    },
  ],
}

// ============================================================================
// API Request/Response Fixtures
// ============================================================================

export const mockCreateChatRequest = {
  title: 'New Chat About COVID',
}

export const mockSaveMessagesRequest = {
  chatId: 'chat-123',
  messages: [
    {
      messageId: 'user-msg-new',
      content: 'What are the symptoms?',
      role: 'user',
      parts: [],
    },
    {
      messageId: 'assistant-msg-new',
      content: 'Common symptoms include fever, cough, and fatigue.',
      role: 'assistant',
      parts: [],
    },
  ],
}

export const mockLikeRequest = {
  messageId: 'msg-456',
  like: true,
}

export const mockSearchRequest = {
  query: 'COVID symptoms',
  limit: 10,
}

// ============================================================================
// AI-Related Fixtures
// ============================================================================

export const mockAIStreamChunk = {
  type: 'text-delta',
  textDelta: 'COVID-19',
}

export const mockAIResponse = {
  text: 'COVID-19 is a disease caused by the SARS-CoV-2 virus.',
  steps: [
    {
      content: [
        {
          type: 'text',
          text: 'COVID-19 is a disease caused by the SARS-CoV-2 virus.',
        },
      ],
    },
  ],
}

export const mockSafeGuardResponse = {
  blocked: false,
}

export const mockUnsafeGuardResponse = {
  blocked: true,
  reason: 'Harmful content detected',
}

// ============================================================================
// Rate Limit Fixtures
// ============================================================================

export const mockRateLimitAllowed = {
  success: true,
  remaining: 95,
  reset: Date.now() + 60000,
  limit: 100,
}

export const mockRateLimitBlocked = {
  success: false,
  remaining: 0,
  reset: Date.now() + 60000,
  limit: 100,
}

// ============================================================================
// Vector Search Fixtures
// ============================================================================

export const mockVectorSearchResults = [
  {
    id: 'vector-1',
    score: 0.95,
    payload: {
      content: 'COVID-19 is caused by the SARS-CoV-2 virus.',
      source: 'who.int',
      title: 'COVID-19 Overview',
    },
  },
  {
    id: 'vector-2',
    score: 0.87,
    payload: {
      content: 'Symptoms include fever, cough, and fatigue.',
      source: 'cdc.gov',
      title: 'Symptoms of COVID-19',
    },
  },
]

export const mockEmbedding = [
  0.1, -0.2, 0.3, -0.4, 0.5, -0.6, 0.7, -0.8, 0.9, -1.0,
]

// ============================================================================
// Error Fixtures
// ============================================================================

export const mockDatabaseError = new Error('Database connection failed')

export const mockAuthenticationError = new Error('Unauthorized: Invalid session')

export const mockRateLimitError = new Error('Rate limit exceeded')

export const mockValidationError = {
  statusCode: 400,
  message: 'Validation failed: title is required',
}

// ============================================================================
// Collections of Fixtures
// ============================================================================

export const allFixtures = {
  users: [mockUser, mockAdmin, mockInactiveUser],
  profiles: [mockProfile, mockAdminProfile],
  chats: [mockChat, mockChat2, mockAdminChat],
  messages: [
    mockUserMessage,
    mockAssistantMessage,
    mockUserMessage2,
    mockAssistantMessage2,
  ],
  likes: [mockLike, mockDislike],
  sessions: [mockSession, mockAdminSession, mockExpiredSession],
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a mock chat with custom values
 */
export const createMockChat = (overrides: Partial<typeof mockChat>) => ({
  ...mockChat,
  ...overrides,
})

/**
 * Create a mock message with custom values
 */
export const createMockMessage = (overrides: Partial<typeof mockUserMessage>) => ({
  ...mockUserMessage,
  ...overrides,
})

/**
 * Create a mock user with custom values
 */
export const createMockUser = (overrides: Partial<typeof mockUser>) => ({
  ...mockUser,
  ...overrides,
})

/**
 * Create a mock profile with custom values
 */
export const createMockProfile = (
  overrides: Partial<typeof mockProfile>,
) => ({
  ...mockProfile,
  ...overrides,
})
