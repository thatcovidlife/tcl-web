import type { LanguageModelUsage } from 'ai'
import type { ModelId } from 'tokenlens'
import { provide, inject, type Ref } from 'vue'

const CONTEXT_KEY = Symbol('ContextContext')

export type ContextSchema = {
  usedTokens: Ref<number>
  maxTokens: Ref<number>
  usage?: LanguageModelUsage
  modelId?: string | ModelId
}

export function provideContext(context: ContextSchema) {
  provide(CONTEXT_KEY, context)
  return context
}

export function useContext() {
  const context = inject<ContextSchema>(CONTEXT_KEY)
  if (!context) {
    throw new Error('Context components must be used within Context')
  }
  return context
}
