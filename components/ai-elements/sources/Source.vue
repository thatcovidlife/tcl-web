<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/lib/utils'
import { BookIcon } from 'lucide-vue-next'

defineOptions({ inheritAttrs: false, name: 'Source' })

const props = defineProps<{
  href?: string
  title?: string
}>()

const attrs = useAttrs()

const linkClasses = computed(() =>
  cn('flex items-center gap-2', attrs.class as string | string[] | undefined),
)

const targetAttr = computed(() => {
  const record = attrs as Record<string, unknown>
  return (record.target as string | undefined) ?? '_blank'
})

const relAttr = computed(() => {
  const record = attrs as Record<string, unknown>
  return (record.rel as string | undefined) ?? 'noreferrer'
})

const restAttrs = computed(() => {
  const rest = { ...attrs } as Record<string, unknown>
  delete rest.class
  delete rest.target
  delete rest.rel
  delete rest.href
  delete rest.title
  return rest
})
</script>

<template>
  <a
    :class="linkClasses"
    :href="props.href"
    :title="props.title"
    :target="targetAttr"
    :rel="relAttr"
    v-bind="restAttrs"
  >
    <slot>
      <BookIcon class="size-4" />
      <span class="block font-medium">{{ props.title }}</span>
    </slot>
  </a>
</template>
