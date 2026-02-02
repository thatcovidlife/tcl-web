<script setup lang="ts">
import { InputGroupButton } from '@/components/ui/input-group'
import type { InputGroupButtonProps as BaseInputGroupButtonProps } from '@/components/ui/input-group'
import { cn } from '@/app/utils'
import { computed, useAttrs, useSlots } from 'vue'

const props = withDefaults(
  defineProps<
    BaseInputGroupButtonProps & {
      disabled?: boolean
      type?: string
    }
  >(),
  {
    disabled: false,
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
    :disabled="props.disabled"
  >
    <slot />
  </InputGroupButton>
</template>
