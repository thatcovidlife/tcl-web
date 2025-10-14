import { inject, provide, type ComputedRef, type Ref } from 'vue'

const CONTEXT_KEY = Symbol('ReasoningContext')

export type ReasoningContext = {
  isStreaming: ComputedRef<boolean>
  isOpen: Ref<boolean>
  setIsOpen: (open: boolean) => void
  duration: Ref<number>
}

export function provideReasoning(context: ReasoningContext) {
  provide(CONTEXT_KEY, context)
  return context
}

export function useReasoning() {
  const context = inject<ReasoningContext>(CONTEXT_KEY)
  if (!context) {
    throw new Error('Reasoning components must be used within Reasoning')
  }
  return context
}
