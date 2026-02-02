import { provide, inject, type Ref } from 'vue'

const CONTEXT_KEY = Symbol('ChainOfThoughtContext')

export type ChainOfThoughtContext = {
  isOpen: Ref<boolean>
}

export function provideChainOfThought(context: ChainOfThoughtContext) {
  provide(CONTEXT_KEY, context)
  return context
}

export function useChainOfThought() {
  const context = inject<ChainOfThoughtContext>(CONTEXT_KEY)
  if (!context) {
    throw new Error(
      'ChainOfThought components must be used within ChainOfThought',
    )
  }
  return context
}
