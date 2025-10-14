<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { nanoid } from 'nanoid'

import {
  providePromptInputController,
  provideProviderAttachments,
} from './prompt-input-context'
import type { PromptInputAttachmentFile } from './types'

const props = withDefaults(
  defineProps<{
    initialInput?: string
  }>(),
  {
    initialInput: '',
  },
)

const textInputValue = shallowRef(props.initialInput)

watch(
  () => props.initialInput,
  (value) => {
    textInputValue.value = value ?? ''
  },
)

const attachmentFiles = shallowRef<PromptInputAttachmentFile[]>([])
const fileInputRef = shallowRef<HTMLInputElement | null>(null)
const openHandler = shallowRef<(() => void) | null>(null)

function revokeUrl(url?: string) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

function add(files: File[] | FileList) {
  const incoming = Array.from(files)
  if (incoming.length === 0) return
  const mapped = incoming.map<PromptInputAttachmentFile>((file) => ({
    id: nanoid(),
    type: 'file',
    url: URL.createObjectURL(file),
    mediaType: file.type,
    filename: file.name,
  }))
  attachmentFiles.value = attachmentFiles.value.concat(mapped)
}

function remove(id: string) {
  const found = attachmentFiles.value.find((file) => file.id === id)
  if (found) {
    revokeUrl(found.url)
  }
  attachmentFiles.value = attachmentFiles.value.filter((file) => file.id !== id)
}

function clear() {
  attachmentFiles.value.forEach((file) => revokeUrl(file.url))
  attachmentFiles.value = []
}

function openFileDialog() {
  openHandler.value?.()
}

const attachments = provideProviderAttachments({
  files: attachmentFiles,
  add,
  remove,
  clear,
  openFileDialog,
  fileInputRef,
})

function __registerFileInput(
  ref: { value: HTMLInputElement | null },
  open: () => void,
) {
  fileInputRef.value = ref.value
  openHandler.value = open
}

const controller = providePromptInputController({
  textInput: {
    value: computed({
      get: () => textInputValue.value,
      set: (value: string) => {
        textInputValue.value = value
      },
    }),
    setInput(value: string) {
      textInputValue.value = value
    },
    clear() {
      textInputValue.value = ''
    },
  },
  attachments,
  __registerFileInput,
})

onBeforeUnmount(() => {
  attachmentFiles.value.forEach((file) => revokeUrl(file.url))
})
</script>

<template>
  <slot />
</template>
