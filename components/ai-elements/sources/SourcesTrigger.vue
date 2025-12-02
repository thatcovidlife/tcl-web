<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { ChevronDownIcon } from 'lucide-vue-next'

defineOptions({ inheritAttrs: false, name: 'SourcesTrigger' })

const props = withDefaults(
  defineProps<{
    count?: number
  }>(),
  {
    count: 0,
  },
)

const attrs = useAttrs()

const triggerClasses = computed(() =>
  cn('flex items-center gap-2', attrs.class as string | string[] | undefined),
)

const restAttrs = computed(() => {
  const { class: _class, ...rest } = attrs as Record<string, unknown>
  return rest
})
</script>

<template>
  <CollapsibleTrigger :class="triggerClasses" v-bind="restAttrs">
    <slot>
      <p class="font-medium">Used {{ props.count }} sources</p>
      <ChevronDownIcon class="size-4" />
    </slot>
  </CollapsibleTrigger>
</template>
