<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { Button } from '@/components/ui/button'
import type { ButtonVariants } from '@/components/ui/button'
import { cn } from '@/app/utils'

defineOptions({ inheritAttrs: false, name: 'Suggestion' })

const emit = defineEmits<{
  (e: 'select', suggestion: string): void
  (e: 'click', event: MouseEvent): void
}>()

const props = withDefaults(
  defineProps<{
    suggestion: string
    variant?: ButtonVariants['variant']
    size?: ButtonVariants['size']
    onSelect?: (suggestion: string) => void
  }>(),
  {
    variant: 'outline',
    size: 'sm',
  },
)

const attrs = useAttrs()

const buttonClasses = computed(() =>
  cn(
    'cursor-pointer rounded-full px-4',
    attrs.class as string | string[] | undefined,
  ),
)

const restAttrs = computed(() => {
  const { class: _class, ...rest } = attrs as Record<string, unknown>
  return rest
})

const handleClick = (event: MouseEvent) => {
  props.onSelect?.(props.suggestion)
  emit('select', props.suggestion)
  emit('click', event)
}
</script>

<template>
  <Button
    type="button"
    :variant="props.variant"
    :size="props.size"
    :class="buttonClasses"
    v-bind="restAttrs"
    @click="handleClick"
  >
    <slot>{{ props.suggestion }}</slot>
  </Button>
</template>
