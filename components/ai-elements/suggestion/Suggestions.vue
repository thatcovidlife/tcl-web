<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false, name: 'Suggestions' })

const props = defineProps<{
  contentClass?: string | string[]
}>()

const attrs = useAttrs()

const rootClasses = computed(() =>
  cn(
    'w-full overflow-x-auto whitespace-nowrap',
    attrs.class as string | string[] | undefined,
  ),
)

const contentClasses = computed(() =>
  cn('flex w-max flex-nowrap items-center gap-2', props.contentClass),
)

const restAttrs = computed(() => {
  const { class: _class, ...rest } = attrs as Record<string, unknown>
  return rest
})
</script>

<template>
  <ScrollArea :class="rootClasses" v-bind="restAttrs">
    <div :class="contentClasses">
      <slot />
    </div>
    <ScrollBar class="hidden" orientation="horizontal" />
  </ScrollArea>
</template>
