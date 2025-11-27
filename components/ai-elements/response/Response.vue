<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { renderMarkdown } from './markdown'

defineOptions({ inheritAttrs: false, name: 'Response' })

const props = defineProps<{
  class?: HTMLAttributes['class']
  value?: unknown
}>()

const attrs = useAttrs()

const responseClasses = computed(() =>
  cn(
    'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 markdown-body',
    props.class,
    attrs.class as HTMLAttributes['class'],
  ),
)
const content = ref<string>('')

watch(
  () => props.value,
  async (newValue) => {
    if (typeof newValue === 'string') {
      const rendered = await renderMarkdown(newValue)
      content.value = rendered
    }
  },
  { immediate: true },
)
</script>

<template>
  <span v-hydrate-citations :class="responseClasses" v-html="content" />
</template>
