<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { HTMLAttributes } from 'vue'
import type { UIMessage } from 'ai'
import { cn } from '@/app/utils'

defineOptions({ inheritAttrs: false, name: 'Message' })

const props = defineProps<{
  from: UIMessage['role']
  class?: HTMLAttributes['class']
}>()

const attrs = useAttrs()

const rootClasses = computed(() =>
  cn(
    'group flex w-full items-end justify-end gap-2 py-4',
    props.from === 'user'
      ? 'is-user'
      : 'is-assistant flex-row-reverse justify-end',
    props.class,
    attrs.class as HTMLAttributes['class'],
  ),
)

const restAttrs = computed(() => {
  const { class: _class, ...rest } = attrs as Record<string, unknown>
  return rest
})
</script>

<template>
  <div :class="rootClasses" v-bind="restAttrs">
    <slot />
  </div>
</template>
