<script setup lang="ts">
import { SelectItem } from '@/components/ui/select'
import { computed, useAttrs } from 'vue'

const props = defineProps<{
  value: string | number
  disabled?: boolean
}>()

const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { value: _value, disabled: _disabled, ...rest } = attrs
  return rest
})
</script>

<template>
  <SelectItem
    v-bind="forwardedAttrs"
    :disabled="props.disabled"
    :value="props.value"
  >
    <slot />
  </SelectItem>
</template>
