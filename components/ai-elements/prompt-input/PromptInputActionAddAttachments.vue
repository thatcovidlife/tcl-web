<script setup lang="ts">
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { ImageIcon } from 'lucide-vue-next'
import { useAttrs } from 'vue'

import { usePromptInputAttachments } from './prompt-input-context'

const props = withDefaults(
  defineProps<{
    label?: string
  }>(),
  {
    label: 'Add photos or files',
  },
)

const emits = defineEmits<{
  (event: 'select', payload: Event): void
}>()

const attrs = useAttrs()
const attachments = usePromptInputAttachments()

function handleSelect(event: Event) {
  if ('preventDefault' in event) {
    event.preventDefault()
  }
  attachments.openFileDialog()
  emits('select', event)
}
</script>

<template>
  <DropdownMenuItem v-bind="attrs" @select="handleSelect">
    <ImageIcon class="mr-2 size-4" />
    {{ props.label }}
  </DropdownMenuItem>
</template>
