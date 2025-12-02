<script setup lang="ts">
import { InputGroupAddon } from '@/components/ui/input-group'
import { cn } from '@/lib/utils'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { usePromptInputAttachments } from './prompt-input-context'

const props = defineProps<{
  class?: string
}>()

const attachments = usePromptInputAttachments()
const height = ref(0)
const contentRef = ref<HTMLDivElement | null>(null)
let resizeObserver: ResizeObserver | null = null

function updateHeight() {
  if (contentRef.value) {
    height.value = contentRef.value.getBoundingClientRect().height
  }
}

onMounted(() => {
  if (!contentRef.value) return
  resizeObserver = new ResizeObserver(() => {
    updateHeight()
  })
  resizeObserver.observe(contentRef.value)
  updateHeight()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

watch(
  () => attachments.files.value.length,
  async () => {
    await nextTick()
    updateHeight()
  },
)

const nonImageFiles = computed(() =>
  attachments.files.value.filter(
    (file) => !(file.mediaType?.startsWith('image/') && file.url),
  ),
)

const imageFiles = computed(() =>
  attachments.files.value.filter(
    (file) => file.mediaType?.startsWith('image/') && file.url,
  ),
)
</script>

<template>
  <InputGroupAddon
    v-if="attachments.files.value.length"
    align="block-start"
    aria-live="polite"
    :class="
      cn(
        'overflow-hidden transition-[height] duration-200 ease-out',
        props.class,
      )
    "
    :style="{ height: `${height}px` }"
  >
    <div ref="contentRef" class="space-y-2 py-1">
      <div class="flex flex-wrap gap-2">
        <slot v-for="file in nonImageFiles" :key="file.id" :attachment="file" />
      </div>
      <div class="flex flex-wrap gap-2">
        <slot v-for="file in imageFiles" :key="file.id" :attachment="file" />
      </div>
    </div>
  </InputGroupAddon>
</template>
