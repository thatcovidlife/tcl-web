import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai'

import { fireworksProvider } from './fireworks'

const languageModels = {
  // 'accounts/fireworks/models/gpt-oss-20b': wrapLanguageModel({
  //   middleware: extractReasoningMiddleware({
  //     tagName: 'think',
  //   }),
  //   model: fireworksProvider('accounts/fireworks/models/gpt-oss-20b'),
  // }),
  'accounts/fireworks/models/gpt-oss-120b': wrapLanguageModel({
    middleware: extractReasoningMiddleware({
      tagName: 'think',
    }),
    model: fireworksProvider('accounts/fireworks/models/gpt-oss-120b'),
  }),
  'accounts/fireworks/models/glm-4p7': wrapLanguageModel({
    middleware: extractReasoningMiddleware({
      tagName: 'think',
    }),
    model: fireworksProvider('accounts/fireworks/models/glm-4p7'),
  }),
}

export const model = customProvider({
  languageModels,
})

export type modelID = keyof typeof languageModels

export const MODELS = Object.keys(languageModels)

export const defaultModel: modelID = 'accounts/fireworks/models/glm-4p7'
