<script setup lang="ts">
import { ref } from 'vue'
import { CheckIcon, CopyIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useCodeBlock } from './code-block-context'

const isCopied = ref(false)

const setIsCopied = (value: boolean) => {
  isCopied.value = value
}

const { code } = useCodeBlock()

const emit = defineEmits<{
  (e: 'copy'): void
  (e: 'error', error: Error): void
}>()

const props = defineProps<{
  timeout?: number
}>()

const copyToClipboard = async (e: Event) => {
  e.stopPropagation()
  e.preventDefault()

  if (typeof window === 'undefined' || !navigator.clipboard.writeText) {
    emit('error', new Error('Clipboard API not available'))
    return
  }

  try {
    await navigator.clipboard.writeText(code.value)
    setIsCopied(true)
    emit('copy')
    setTimeout(() => setIsCopied(false), props.timeout || 1000)
  } catch (error) {
    emit('error', error as Error)
  }
}
</script>
<template>
  <div class="absolute top-2 right-2">
    <Button
      size="icon"
      variant="ghost"
      @click="copyToClipboard"
      :aria-label="isCopied ? 'Copied' : 'Copy to clipboard'"
      :title="isCopied ? 'Copied' : 'Copy to clipboard'"
    >
      <component :is="isCopied ? CheckIcon : CopyIcon" :size="14" />
    </Button>
  </div>
</template>
