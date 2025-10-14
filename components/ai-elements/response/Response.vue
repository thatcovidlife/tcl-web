<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import MDC from '@nuxtjs/mdc/runtime/components/MDC.vue'

defineOptions({ inheritAttrs: false, name: 'Response' })

const props = defineProps<{
  class?: HTMLAttributes['class']
  value?: unknown
}>()

const attrs = useAttrs()

type MDCValue = string | Record<string, unknown>

const responseClasses = computed(() =>
  cn(
    'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
    props.class,
    attrs.class as HTMLAttributes['class'],
  ),
)

const resolvedValue = computed<MDCValue>(() => {
  if (props.value !== undefined) {
    return props.value as MDCValue
  }

  const { value: attrValue } = attrs as Record<string, unknown>

  if (attrValue !== undefined) {
    return attrValue as MDCValue
  }

  return ''
})

const restAttrs = computed(() => {
  const {
    class: _class,
    value: _value,
    ...rest
  } = attrs as Record<string, unknown>

  return rest
})
</script>

<template>
  <MDC :class="responseClasses" :value="resolvedValue" v-bind="restAttrs">
    <slot />
  </MDC>
</template>
