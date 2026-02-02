import { provide, inject, type Ref } from 'vue'

const CONTEXT_KEY = Symbol('CodeBlockContext')

export type CodeBlockContext = {
  code: Ref<string>
}

export function provideCodeBlock(context: CodeBlockContext) {
  provide(CONTEXT_KEY, context)
  return context
}

export function useCodeBlock() {
  const context = inject<CodeBlockContext>(CONTEXT_KEY)
  if (!context) {
    throw new Error('CodeBlock components must be used within CodeBlock')
  }
  return context
}
