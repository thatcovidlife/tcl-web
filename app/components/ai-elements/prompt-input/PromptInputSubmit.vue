<script setup lang="ts">
import type { InputGroupButtonProps as BaseInputGroupButtonProps } from '@/components/ui/input-group'
import { Loader2Icon, SendIcon, SquareIcon, XIcon } from 'lucide-vue-next'
import { useAttrs } from 'vue'

import PromptInputButton from './PromptInputButton.vue'
import type { PromptInputStatus } from './types'

const props = withDefaults(
  defineProps<{
    status?: PromptInputStatus
    variant?: BaseInputGroupButtonProps['variant']
    size?: BaseInputGroupButtonProps['size']
    type?: string
  }>(),
  {
    variant: 'default',
    size: 'icon-sm',
    type: 'submit',
  },
)

const attrs = useAttrs()
</script>

<template>
  <PromptInputButton
    v-bind="attrs"
    :size="props.size"
    :type="props.type"
    :variant="props.variant"
    aria-label="Submit"
  >
    <slot>
      <Loader2Icon
        v-if="props.status === 'submitted'"
        class="size-4 animate-spin"
      />
      <SquareIcon v-else-if="props.status === 'streaming'" class="size-4" />
      <XIcon v-else-if="props.status === 'error'" class="size-4" />
      <SendIcon v-else class="size-4" />
    </slot>
  </PromptInputButton>
</template>
