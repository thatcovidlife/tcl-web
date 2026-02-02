<script setup lang="ts">
import { InputGroup } from '@/components/ui/input-group'
import { cn } from '@/app/utils'
import { nanoid } from 'nanoid'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
  watchEffect,
} from 'vue'
import { useAttrs } from 'vue'

import {
  provideLocalAttachments,
  useOptionalPromptInputController,
} from './prompt-input-context'
import type {
  PromptInputAttachmentFile,
  PromptInputError,
  PromptInputMessage,
} from './types'

const props = withDefaults(
  defineProps<{
    accept?: string
    multiple?: boolean
    globalDrop?: boolean
    syncHiddenInput?: boolean
    maxFiles?: number
    maxFileSize?: number
    class?: string
    onError?: (err: PromptInputError) => void
    onSubmit: (
      message: PromptInputMessage,
      event: SubmitEvent,
    ) => void | Promise<void>
  }>(),
  {
    accept: undefined,
    multiple: false,
    globalDrop: false,
    syncHiddenInput: false,
    maxFiles: undefined,
    maxFileSize: undefined,
    class: undefined,
    onError: undefined,
  },
)

const attrs = useAttrs()

const controller = useOptionalPromptInputController()
const inputRef = ref<HTMLInputElement | null>(null)
const anchorRef = ref<HTMLSpanElement | null>(null)
const formRef = ref<HTMLFormElement | null>(null)

const localFiles = ref<PromptInputAttachmentFile[]>([])

function revokeUrl(url?: string) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

const matchesAccept = (file: File) => {
  if (!props.accept || props.accept.trim() === '') {
    return true
  }
  if (props.accept.includes('image/*')) {
    return file.type.startsWith('image/')
  }
  return true
}

function addLocal(files: File[] | FileList) {
  const incoming = Array.from(files)
  if (incoming.length === 0) return

  const accepted = incoming.filter(matchesAccept)
  if (incoming.length > 0 && accepted.length === 0) {
    props.onError?.({
      code: 'accept',
      message: 'No files match the accepted types.',
    })
    return
  }

  const sized = accepted.filter((file) =>
    props.maxFileSize ? file.size <= props.maxFileSize : true,
  )
  if (accepted.length > 0 && sized.length === 0) {
    props.onError?.({
      code: 'max_file_size',
      message: 'All files exceed the maximum size.',
    })
    return
  }

  const capacity =
    typeof props.maxFiles === 'number'
      ? Math.max(0, props.maxFiles - localFiles.value.length)
      : undefined

  const capped = typeof capacity === 'number' ? sized.slice(0, capacity) : sized

  if (typeof capacity === 'number' && sized.length > capacity) {
    props.onError?.({
      code: 'max_files',
      message: 'Too many files. Some were not added.',
    })
  }

  const mapped = capped.map<PromptInputAttachmentFile>((file) => ({
    id: nanoid(),
    type: 'file',
    url: URL.createObjectURL(file),
    mediaType: file.type,
    filename: file.name,
  }))

  localFiles.value = localFiles.value.concat(mapped)
}

function removeLocal(id: string) {
  const found = localFiles.value.find((file) => file.id === id)
  if (found) {
    revokeUrl(found.url)
  }
  localFiles.value = localFiles.value.filter((file) => file.id !== id)
}

function clearLocal() {
  localFiles.value.forEach((file) => revokeUrl(file.url))
  localFiles.value = []
}

function openFileDialogLocal() {
  inputRef.value?.click()
}

const add = controller ? controller.attachments.add : addLocal
const remove = controller ? controller.attachments.remove : removeLocal
const clear = controller ? controller.attachments.clear : clearLocal
const openFileDialog = controller
  ? controller.attachments.openFileDialog
  : openFileDialogLocal

if (!controller) {
  provideLocalAttachments({
    files: localFiles,
    add: addLocal,
    remove: removeLocal,
    clear: clearLocal,
    openFileDialog: openFileDialogLocal,
    fileInputRef: inputRef,
  })
} else {
  onMounted(() => {
    controller.__registerFileInput(inputRef, () => inputRef.value?.click())
  })
}

const files = computed(() =>
  controller ? controller.attachments.files.value : localFiles.value,
)

watch(
  () => files.value.length,
  (length) => {
    if (props.syncHiddenInput && length === 0 && inputRef.value) {
      inputRef.value.value = ''
    }
  },
)

const formDragCleanup = shallowRef<(() => void) | null>(null)
const globalDragCleanup = shallowRef<(() => void) | null>(null)

onMounted(() => {
  const anchor = anchorRef.value
  if (anchor) {
    const form = anchor.closest('form')
    if (form instanceof HTMLFormElement) {
      formRef.value = form
      const handleDragOver = (event: DragEvent) => {
        if (event.dataTransfer?.types?.includes('Files')) {
          event.preventDefault()
        }
      }
      const handleDrop = (event: DragEvent) => {
        if (event.dataTransfer?.types?.includes('Files')) {
          event.preventDefault()
        }
        if (event.dataTransfer?.files?.length) {
          add(event.dataTransfer.files)
        }
      }
      form.addEventListener('dragover', handleDragOver)
      form.addEventListener('drop', handleDrop)
      formDragCleanup.value = () => {
        form.removeEventListener('dragover', handleDragOver)
        form.removeEventListener('drop', handleDrop)
      }
    }
  }

  watchEffect((onCleanup) => {
    if (!props.globalDrop) {
      globalDragCleanup.value?.()
      globalDragCleanup.value = null
      return
    }
    if (typeof document === 'undefined') {
      return
    }
    const handleDragOver = (event: DragEvent) => {
      if (event.dataTransfer?.types?.includes('Files')) {
        event.preventDefault()
      }
    }
    const handleDrop = (event: DragEvent) => {
      if (event.dataTransfer?.types?.includes('Files')) {
        event.preventDefault()
      }
      if (event.dataTransfer?.files?.length) {
        add(event.dataTransfer.files)
      }
    }
    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)
    const cleanup = () => {
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
    }
    globalDragCleanup.value = cleanup
    onCleanup(cleanup)
  })
})

onBeforeUnmount(() => {
  formDragCleanup.value?.()
  globalDragCleanup.value?.()
  if (!controller) {
    clearLocal()
  }
})

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement | null
  if (target?.files) {
    add(target.files)
    target.value = ''
  }
}

async function convertBlobUrlToDataUrl(url: string) {
  const response = await fetch(url)
  const blob = await response.blob()
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to convert blob URL'))
    reader.readAsDataURL(blob)
  })
}

async function handleSubmit(event: SubmitEvent) {
  event.preventDefault()
  const form = event.target as HTMLFormElement | null
  const snapshot = [...files.value]

  const text = controller
    ? controller.textInput.value.value
    : (() => {
        if (!form) return ''
        const formData = new FormData(form)
        const value = formData.get('message')
        return typeof value === 'string' ? value : ''
      })()

  if (!controller && form) {
    await nextTick()
    form.reset()
  }

  const convertedFiles = await Promise.all(
    snapshot.map(async ({ id: _id, ...file }) => {
      if (file.url && file.url.startsWith('blob:')) {
        return {
          ...file,
          url: await convertBlobUrlToDataUrl(file.url),
        }
      }
      return file
    }),
  )

  try {
    await props.onSubmit({ text, files: convertedFiles }, event)
    clear()
    if (controller) {
      controller.textInput.clear()
    }
  } catch (error) {
    // Swallow errors so callers can handle retries.
  }
}
</script>

<template>
  <span aria-hidden="true" class="hidden" ref="anchorRef" />
  <input
    ref="inputRef"
    type="file"
    class="hidden"
    title="Upload files"
    :accept="props.accept"
    :multiple="props.multiple"
    aria-label="Upload files"
    @change="handleChange"
  />
  <form
    v-bind="attrs"
    :class="cn('w-full', props.class)"
    @submit="handleSubmit"
  >
    <InputGroup>
      <slot />
    </InputGroup>
  </form>
</template>
