<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { ToolUIPart } from 'ai'
import { cn } from '@/lib/utils'
import CodeBlock from '../code-block/CodeBlock.vue'

defineOptions({ inheritAttrs: false, name: 'ToolInput' })

const props = defineProps<{
  input: ToolUIPart['input']
}>()

const attrs = useAttrs()

const wrapperClasses = computed(() =>
  cn(
    'space-y-2 overflow-hidden p-4',
    attrs.class as string | string[] | undefined,
  ),
)

const restAttrs = computed(() => {
  const { class: _class, ...rest } = attrs as Record<string, unknown>
  return rest
})

const formattedInput = computed(() => {
  try {
    const serialized = JSON.stringify(props.input, null, 2)
    return serialized ?? ''
  } catch (error) {
    return ''
  }
})
</script>

<template>
  <div :class="wrapperClasses" v-bind="restAttrs">
    <h4
      class="font-medium text-muted-foreground text-xs uppercase tracking-wide"
    >
      Parameters
    </h4>
    <div class="rounded-md bg-muted/50">
      <CodeBlock :code="formattedInput" language="json" />
    </div>
  </div>
</template>
