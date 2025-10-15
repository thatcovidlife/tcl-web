import { deepinfra } from '@ai-sdk/deepinfra'
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai'

const languageModels = {
  'Qwen/Qwen3-30B-A3B': wrapLanguageModel({
    middleware: extractReasoningMiddleware({
      tagName: 'think',
    }),
    model: deepinfra('Qwen/Qwen3-30B-A3B'),
  }),
  'openai/gpt-oss-120b': wrapLanguageModel({
    middleware: extractReasoningMiddleware({
      tagName: 'think',
    }),
    model: deepinfra('openai/gpt-oss-120b'),
  }),
}

export const model = customProvider({
  languageModels,
})

export type modelID = keyof typeof languageModels

export const MODELS = Object.keys(languageModels)

export const defaultModel: modelID = 'Qwen/Qwen3-30B-A3B'
