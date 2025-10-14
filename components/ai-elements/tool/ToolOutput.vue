<script setup lang="ts">
import { computed, isVNode, useAttrs, type Component, type VNode } from 'vue'
import type { ToolUIPart } from 'ai'
import { cn } from '@/lib/utils'
import CodeBlock from '../code-block/CodeBlock.vue'

defineOptions({ inheritAttrs: false, name: 'ToolOutput' })

const props = defineProps<{
  output: ToolUIPart['output']
  errorText: ToolUIPart['errorText']
}>()

const attrs = useAttrs()

const hasContent = computed(
  () => Boolean(props.output) || Boolean(props.errorText),
)

const wrapperClasses = computed(() =>
  cn('space-y-2 p-4', attrs.class as string | string[] | undefined),
)

const restAttrs = computed(() => {
  const { class: _class, ...rest } = attrs as Record<string, unknown>
  return rest
})

const headingLabel = computed(() => (props.errorText ? 'Error' : 'Result'))

const surfaceClasses = computed(() =>
  cn(
    'overflow-x-auto rounded-md text-xs [&_table]:w-full',
    props.errorText
      ? 'bg-destructive/10 text-destructive'
      : 'bg-muted/50 text-foreground',
  ),
)

const isVNodeOutput = computed(() => isVNode(props.output as unknown))

const vnodeComponent = computed<Component | null>(() => {
  if (!isVNodeOutput.value) return null
  return {
    setup() {
      return () => props.output as VNode
    },
  }
})

const shouldRenderObjectAsCode = computed(() => {
  if (!props.output) return false
  return typeof props.output === 'object' && !isVNodeOutput.value
})

const shouldRenderStringAsCode = computed(
  () => typeof props.output === 'string',
)

const shouldRenderPrimitiveAsCode = computed(() => {
  const type = typeof props.output
  return type === 'number' || type === 'boolean'
})

const showCodeBlock = computed(
  () =>
    shouldRenderStringAsCode.value ||
    shouldRenderObjectAsCode.value ||
    shouldRenderPrimitiveAsCode.value,
)

const formattedOutput = computed(() => {
  if (shouldRenderStringAsCode.value) {
    return props.output as string
  }

  if (shouldRenderObjectAsCode.value || shouldRenderPrimitiveAsCode.value) {
    try {
      const serialized = JSON.stringify(props.output, null, 2)
      return serialized ?? '[unserializable output]'
    } catch (error) {
      return '[unserializable output]'
    }
  }

  return ''
})

const fallbackOutputText = computed(() => {
  if (props.output === undefined || props.output === null) {
    return ''
  }

  return String(props.output)
})
</script>

<template>
  <div v-if="hasContent" :class="wrapperClasses" v-bind="restAttrs">
    <h4
      class="font-medium text-muted-foreground text-xs uppercase tracking-wide"
    >
      {{ headingLabel }}
    </h4>
    <div :class="surfaceClasses">
      <div v-if="props.errorText">{{ props.errorText }}</div>
      <CodeBlock v-if="showCodeBlock" :code="formattedOutput" language="json" />
      <component v-else-if="vnodeComponent" :is="vnodeComponent" />
      <div v-else-if="fallbackOutputText">{{ fallbackOutputText }}</div>
    </div>
  </div>
</template>
