<script setup lang="ts">
import { InputGroupButton } from '@/components/ui/input-group'
import type { InputGroupButtonProps as BaseInputGroupButtonProps } from '@/components/ui/input-group'
import { cn } from '@/lib/utils'
import { computed, useAttrs, useSlots } from 'vue'

const props = withDefaults(
  defineProps<
    BaseInputGroupButtonProps & {
      type?: string
    }
  >(),
  {
    variant: 'ghost',
    type: 'button',
  },
)

const attrs = useAttrs()
const slots = useSlots()

const size = computed(() => {
  if (props.size) {
    return props.size
  }
  const content = slots.default?.() ?? []
  return content.length > 1 ? 'sm' : 'icon-sm'
})
</script>

<template>
  <InputGroupButton
    v-bind="attrs"
    :class="cn(props.class)"
    :size="size"
    :type="props.type"
    :variant="props.variant"
  >
    <slot />
  </InputGroupButton>
</template>
