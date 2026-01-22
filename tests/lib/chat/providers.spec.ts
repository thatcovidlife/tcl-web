/**
 * AI Chat Providers Tests
 *
 * Tests the LLM provider configuration and model selection.
 *
 * @see lib/chat/providers.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock AI SDK and DeepInfra before importing
const mockDeepinfra = vi.fn((modelId: string) => ({
  id: modelId,
  provider: 'deepinfra',
}))

vi.mock('@ai-sdk/deepinfra', () => ({
  deepinfra: mockDeepinfra,
  // Mock embeddingModel
  embeddingModel: vi.fn((modelId: string) => ({
    id: modelId,
    provider: 'deepinfra-embedding',
  })),
}))

vi.mock('ai', () => ({
  customProvider: vi.fn((options: any) => ({
    languageModels: options.languageModels,
  })),
  wrapLanguageModel: vi.fn((options: any) => options.model),
  extractReasoningMiddleware: vi.fn((options: any) => options),
  embed: vi.fn(),
}))

describe('AI Chat Providers', () => {
  let providersModule: any

  beforeAll(async () => {
    providersModule = await import('~/lib/chat/providers')
  })

  beforeEach(() => {
    // Don't clear module-level mocks - they were called during import
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // Manually restore only console mocks, not module-level mocks
    const consoleLog = console.log as any
    const consoleError = console.error as any
    if (consoleLog.mockRestore) consoleLog.mockRestore()
    if (consoleError.mockRestore) consoleError.mockRestore()
  })

  // ==========================================================================
  // Model Configuration Tests
  // ==========================================================================

  describe('Model Configuration', () => {
    it('should export all available models', () => {
      const { MODELS, defaultModel } = providersModule

      expect(MODELS).toEqual(['openai/gpt-oss-120b', 'zai-org/GLM-4.7'])
      expect(defaultModel).toBe('openai/gpt-oss-120b')
    })

    it('should have correct default model', () => {
      const { defaultModel } = providersModule

      expect(defaultModel).toBe('openai/gpt-oss-120b')
    })

    it('should export custom provider', () => {
      const { model } = providersModule

      expect(model).toBeDefined()
      expect(model.languageModels).toBeDefined()
    })

    it('should support gpt-oss-120b model', () => {
      const { model } = providersModule

      expect(model.languageModels['openai/gpt-oss-120b']).toBeDefined()
      expect(model.languageModels['openai/gpt-oss-120b'].id).toBe('openai/gpt-oss-120b')
      expect(model.languageModels['openai/gpt-oss-120b'].provider).toBe('deepinfra')
    })

    it('should support GLM-4.7 model', () => {
      const { model } = providersModule

      expect(model.languageModels['zai-org/GLM-4.7']).toBeDefined()
      expect(model.languageModels['zai-org/GLM-4.7'].id).toBe('zai-org/GLM-4.7')
      expect(model.languageModels['zai-org/GLM-4.7'].provider).toBe('deepinfra')
    })
  })

  // ==========================================================================
  // Model Type Tests
  // ==========================================================================

  describe('Model Type Safety', () => {
    it('should have correct model type IDs', () => {
      const { MODELS } = providersModule

      expect(MODELS).toContain('openai/gpt-oss-120b')
      expect(MODELS).toContain('zai-org/GLM-4.7')
    })

    it('should export modelID type', () => {
      expect(providersModule).toBeDefined()
    })
  })

  // ==========================================================================
  // Integration Tests
  // ==========================================================================

  describe('Provider Integration', () => {
    it('should call deepinfra for each model', () => {
      expect(mockDeepinfra).toHaveBeenCalledWith('openai/gpt-oss-120b')
      expect(mockDeepinfra).toHaveBeenCalledWith('zai-org/GLM-4.7')
    })

    it('should call deepinfra twice for two models', () => {
      expect(mockDeepinfra).toHaveBeenCalledTimes(2)
    })
  })

  // ==========================================================================
  // Constants Tests
  // ==========================================================================

  describe('Exported Constants', () => {
    it('should export MODELS array with all model IDs', () => {
      const { MODELS } = providersModule

      expect(Array.isArray(MODELS)).toBe(true)
      expect(MODELS.length).toBe(2)
      expect(MODELS).toMatchSnapshot()
    })

    it('should export defaultModel constant', () => {
      const { defaultModel } = providersModule

      expect(typeof defaultModel).toBe('string')
      expect(defaultModel.length).toBeGreaterThan(0)
    })
  })
})
