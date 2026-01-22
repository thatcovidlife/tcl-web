/**
 * Vector Embedding & Search Tests
 *
 * Tests the Qdrant vector database integration for semantic search.
 *
 * @see lib/chat/embedding.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'

// Mock external services before importing
const mockQdrantSearch = vi.fn()
const mockEmbed = vi.fn()

vi.mock('@ai-sdk/deepinfra', () => ({
  deepinfra: {
    embeddingModel: vi.fn((modelId: string) => ({
      id: modelId,
      provider: 'deepinfra-embedding',
    })),
  },
}))

vi.mock('@qdrant/js-client-rest', () => ({
  QdrantClient: vi.fn().mockImplementation((config: any) => ({
    url: config.url,
    apiKey: config.apiKey,
    search: mockQdrantSearch,
  })),
}))

vi.mock('ai', () => ({
  embed: mockEmbed,
}))

const mockEmbedding = [0.1, -0.2, 0.3, -0.4, 0.5]
const mockSearchResults = [
  {
    id: 'point-1',
    score: 0.95,
    payload: {
      content: 'COVID-19 is a disease caused by SARS-CoV-2 virus.',
      source: 'who.int',
      title: 'COVID-19 Overview',
    },
  },
  {
    id: 'point-2',
    score: 0.87,
    payload: {
      content: 'Symptoms include fever, cough, and fatigue.',
      source: 'cdc.gov',
      title: 'Symptoms of COVID-19',
    },
  },
]

describe('Vector Embedding & Search', () => {
  let embeddingModule: any

  beforeAll(async () => {
    // Set required environment variables before importing
    process.env.DEEPINFRA_EMBED_MODEL = 'test-embed-model'
    process.env.QDRANT_URL = 'https://test.qdrant.io'
    process.env.QDRANT_KEY = 'test-qdrant-key'
    process.env.QDRANT_COLLECTION = 'test-collection'
    process.env.DEEPINFRA_MAX_RESULTS = '5'

    embeddingModule = await import('~/lib/chat/embedding')
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ==========================================================================
  // Configuration Tests
  // ==========================================================================

  describe('Configuration', () => {
    it('should initialize Qdrant client with correct config', () => {
      const { qdrant } = embeddingModule

      expect(qdrant).toBeDefined()
      expect(qdrant.url).toBe('https://test.qdrant.io')
      expect(qdrant.apiKey).toBe('test-qdrant-key')
    })

    it('should initialize embedding model', () => {
      const { embeddingModel } = embeddingModule

      expect(embeddingModel).toBeDefined()
      expect(embeddingModel.id).toBe('test-embed-model')
      expect(embeddingModel.provider).toBe('deepinfra-embedding')
    })
  })

  // ==========================================================================
  // generateEmbedding Tests
  // ==========================================================================

  describe('generateEmbedding', () => {
    it('should generate embedding for text', async () => {
      mockEmbed.mockResolvedValue({
        embedding: mockEmbedding,
      })

      const result = await embeddingModule.generateEmbedding('COVID-19 information')

      expect(result).toEqual(mockEmbedding)
      expect(mockEmbed).toHaveBeenCalledWith({
        model: expect.any(Object),
        value: 'COVID-19 information',
      })
    })

    it('should replace newlines with spaces', async () => {
      mockEmbed.mockResolvedValue({
        embedding: mockEmbedding,
      })

      await embeddingModule.generateEmbedding('Line 1\nLine 2\nLine 3')

      expect(mockEmbed).toHaveBeenCalledWith({
        model: expect.any(Object),
        value: 'Line 1 Line 2 Line 3',
      })
    })

    it('should handle empty text', async () => {
      mockEmbed.mockResolvedValue({
        embedding: [],
      })

      const result = await embeddingModule.generateEmbedding('')

      expect(result).toEqual([])
    })

    it('should handle text with multiple consecutive newlines', async () => {
      mockEmbed.mockResolvedValue({
        embedding: mockEmbedding,
      })

      await embeddingModule.generateEmbedding('Line 1\n\n\nLine 2')

      expect(mockEmbed).toHaveBeenCalledWith({
        model: expect.any(Object),
        value: 'Line 1   Line 2', // Three newlines become three spaces
      })
    })

    it('should handle unicode text', async () => {
      mockEmbed.mockResolvedValue({
        embedding: mockEmbedding,
      })

      await embeddingModule.generateEmbedding('Hello 世界 🌍')

      expect(mockEmbed).toHaveBeenCalledWith({
        model: expect.any(Object),
        value: 'Hello 世界 🌍',
      })
    })

    it('should return valid vector array', async () => {
      mockEmbed.mockResolvedValue({
        embedding: [0.1, -0.2, 0.3],
      })

      const result = await embeddingModule.generateEmbedding('test')

      expect(Array.isArray(result)).toBe(true)
      expect(result.every((v) => typeof v === 'number')).toBe(true)
    })
  })

  // ==========================================================================
  // findRelevantContent Tests
  // ==========================================================================

  describe('findRelevantContent', () => {
    it('should search Qdrant with embedding', async () => {
      mockEmbed.mockResolvedValue({ embedding: mockEmbedding })
      mockQdrantSearch.mockResolvedValue(mockSearchResults)

      const results = await embeddingModule.findRelevantContent('What is COVID-19?')

      expect(mockQdrantSearch).toHaveBeenCalledWith('test-collection', {
        vector: mockEmbedding,
        limit: 5,
      })
      expect(results).toEqual(mockSearchResults)
    })

    it('should use custom collection if provided', async () => {
      mockEmbed.mockResolvedValue({ embedding: mockEmbedding })
      mockQdrantSearch.mockResolvedValue([])

      await embeddingModule.findRelevantContent('test query', 'custom-collection')

      expect(mockQdrantSearch).toHaveBeenCalledWith('custom-collection', {
        vector: mockEmbedding,
        limit: 5,
      })
    })

    it('should respect max results limit from config', async () => {
      mockEmbed.mockResolvedValue({ embedding: mockEmbedding })
      mockQdrantSearch.mockResolvedValue([])

      await embeddingModule.findRelevantContent('test query')

      const searchCall = mockQdrantSearch.mock.calls[0]
      expect(searchCall[1].limit).toBe(5)
    })

    it('should return null on Qdrant error', async () => {
      mockEmbed.mockResolvedValue({ embedding: mockEmbedding })
      mockQdrantSearch.mockRejectedValue(new Error('Qdrant connection failed'))

      const results = await embeddingModule.findRelevantContent('test query')

      expect(results).toBeNull()
    })

    it('should return search results with score and payload', async () => {
      mockEmbed.mockResolvedValue({ embedding: mockEmbedding })
      mockQdrantSearch.mockResolvedValue(mockSearchResults)

      const results = await embeddingModule.findRelevantContent('test query')

      expect(results).toEqual(mockSearchResults)
      expect(results?.[0].score).toBe(0.95)
      expect(results?.[0].payload.content).toBeDefined()
    })
  })

  // ==========================================================================
  // Integration Workflow Tests
  // ==========================================================================

  describe('Integration Workflow', () => {
    it('should generate embedding and search in sequence', async () => {
      mockEmbed.mockResolvedValue({ embedding: mockEmbedding })
      mockQdrantSearch.mockResolvedValue(mockSearchResults)

      const results = await embeddingModule.findRelevantContent('COVID symptoms')

      // Should have generated embedding first
      expect(mockEmbed).toHaveBeenCalled()

      // Should have searched with the generated embedding
      expect(mockQdrantSearch).toHaveBeenCalledWith('test-collection', {
        vector: mockEmbedding,
        limit: 5,
      })

      // Should return search results
      expect(results).toEqual(mockSearchResults)
    })

    it('should handle long queries', async () => {
      const longQuery = 'a'.repeat(10000)

      mockEmbed.mockResolvedValue({ embedding: mockEmbedding })
      mockQdrantSearch.mockResolvedValue([])

      await embeddingModule.findRelevantContent(longQuery)

      expect(mockEmbed).toHaveBeenCalled()
      expect(mockQdrantSearch).toHaveBeenCalled()
    })
  })

  // ==========================================================================
  // Edge Cases Tests
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle search with no results', async () => {
      mockEmbed.mockResolvedValue({ embedding: mockEmbedding })
      mockQdrantSearch.mockResolvedValue([])

      const results = await embeddingModule.findRelevantContent('test query')

      expect(results).toEqual([])
    })

    it('should handle Qdrant timeout', async () => {
      mockEmbed.mockResolvedValue({ embedding: mockEmbedding })
      mockQdrantSearch.mockRejectedValue(new Error('Timeout'))

      const results = await embeddingModule.findRelevantContent('test query')

      expect(results).toBeNull()
    })

    it('should handle embedding generation error', async () => {
      mockEmbed.mockRejectedValue(new Error('Embedding API error'))

      await expect(
        embeddingModule.generateEmbedding('test'),
      ).rejects.toThrow('Embedding API error')
    })
  })

  // ==========================================================================
  // Export Tests
  // ==========================================================================

  describe('Exports', () => {
    it('should export generateEmbedding function', () => {
      expect(typeof embeddingModule.generateEmbedding).toBe('function')
    })

    it('should export findRelevantContent function', () => {
      expect(typeof embeddingModule.findRelevantContent).toBe('function')
    })

    it('should export qdrant client', () => {
      expect(embeddingModule.qdrant).toBeDefined()
    })

    it('should export embeddingModel', () => {
      expect(embeddingModule.embeddingModel).toBeDefined()
    })
  })
})
