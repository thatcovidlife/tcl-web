<script setup lang="ts">
import { computed, useAttrs, watch, type Ref } from 'vue'
import { Collapsible } from '@/components/ui/collapsible'
import { cn } from '@/app/utils'
import { provideTool } from './tool-context'

defineOptions({ inheritAttrs: false, name: 'Tool' })

const emit = defineEmits<{
  (e: 'update:open', open: boolean): void
}>()

const props = withDefaults(
  defineProps<{
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
  }>(),
  {
    defaultOpen: true,
  },
)

const attrs = useAttrs()

const defaultOpen = computed(() => props.defaultOpen ?? true)

const isOpen = defineModel<boolean>('open')

if (isOpen.value === undefined) {
  isOpen.value = defaultOpen.value
}

provideTool({
  isOpen: isOpen as Ref<boolean>,
})

watch(isOpen, (value) => {
  const next = Boolean(value)
  emit('update:open', next)
  props.onOpenChange?.(next)
})

const rootClasses = computed(() =>
  cn(
    'not-prose mb-4 w-full rounded-md border',
    attrs.class as string | string[] | undefined,
  ),
)

const restAttrs = computed(() => {
  const { class: _class, ...rest } = attrs as Record<string, unknown>
  return rest
})
</script>

<template>
  <Collapsible
    v-model:open="isOpen"
    :default-open="defaultOpen"
    :class="rootClasses"
    v-bind="restAttrs"
  >
    <slot />
  </Collapsible>
</template>
