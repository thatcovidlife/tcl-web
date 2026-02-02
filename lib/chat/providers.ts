import { deepinfra } from '@ai-sdk/deepinfra'
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai'

const languageModels = {
  // 'openai/gpt-oss-20b': wrapLanguageModel({
  //   middleware: extractReasoningMiddleware({
  //     tagName: 'think',
  //   }),
  //   model: deepinfra('openai/gpt-oss-20b'),
  // }),
  'openai/gpt-oss-120b': wrapLanguageModel({
    middleware: extractReasoningMiddleware({
      tagName: 'think',
    }),
    model: deepinfra('openai/gpt-oss-120b'),
  }),
  'zai-org/GLM-4.7': wrapLanguageModel({
    middleware: extractReasoningMiddleware({
      tagName: 'think',
    }),
    model: deepinfra('zai-org/GLM-4.7'),
  }),
}

export const model = customProvider({
  languageModels,
})

export type modelID = keyof typeof languageModels

export const MODELS = Object.keys(languageModels)

export const defaultModel: modelID = 'openai/gpt-oss-120b'
