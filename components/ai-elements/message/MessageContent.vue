<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { messageContentVariants } from './message-content-variants'
import type { MessageContentVariants } from './message-content-variants'

defineOptions({ inheritAttrs: false, name: 'MessageContent' })

const props = defineProps<{
  variant?: MessageContentVariants['variant']
  class?: HTMLAttributes['class']
}>()

const attrs = useAttrs()

const contentClasses = computed(() =>
  cn(
    messageContentVariants({ variant: props.variant }),
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
  <div :class="contentClasses" v-bind="restAttrs">
    <slot />
  </div>
</template>
