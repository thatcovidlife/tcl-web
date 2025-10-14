import { inject, provide, type Ref } from 'vue'

const TOOL_CONTEXT_KEY = Symbol('ToolContext')

export type ToolContext = {
  isOpen: Ref<boolean>
}

export function provideTool(context: ToolContext) {
  provide(TOOL_CONTEXT_KEY, context)
  return context
}

export function useTool() {
  const context = inject<ToolContext>(TOOL_CONTEXT_KEY)

  if (!context) {
    throw new Error('Tool components must be used within Tool')
  }

  return context
}
