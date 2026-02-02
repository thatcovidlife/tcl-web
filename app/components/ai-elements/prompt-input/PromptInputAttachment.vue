<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PaperclipIcon, XIcon } from 'lucide-vue-next'
import { cn } from '@/app/utils'

import { usePromptInputAttachments } from './prompt-input-context'
import type { PromptInputAttachmentFile } from './types'

const props = defineProps<{
  data: PromptInputAttachmentFile
  class?: string
}>()

const attachments = usePromptInputAttachments()

const mediaType = computed(() => {
  const isImage = props.data.mediaType?.startsWith('image/') && props.data.url
  return isImage ? 'image' : 'file'
})

function removeAttachment() {
  attachments.remove(props.data.id)
}
</script>

<template>
  <div
    :class="
      cn(
        'group relative rounded-md border',
        mediaType === 'image' ? 'h-14 w-14' : 'h-8 w-auto max-w-full',
        props.class,
      )
    "
    role="group"
  >
    <img
      v-if="mediaType === 'image' && data.url"
      :alt="data.filename || 'attachment'"
      class="size-full rounded-md object-cover"
      height="56"
      :src="data.url"
      width="56"
    />
    <div
      v-else
      class="flex size-full max-w-full cursor-pointer items-center justify-start gap-2 overflow-hidden px-2 text-muted-foreground"
    >
      <PaperclipIcon class="size-4 shrink-0" />
      <Tooltip :delay-duration="400">
        <TooltipTrigger class="min-w-0 flex-1 text-left">
          <h4 class="w-full truncate text-sm font-medium">
            {{ data.filename || 'Unknown file' }}
          </h4>
        </TooltipTrigger>
        <TooltipContent>
          <div class="text-xs text-muted-foreground">
            <h4
              class="max-w-[240px] overflow-hidden whitespace-normal break-words text-left text-sm font-semibold"
            >
              {{ data.filename || 'Unknown file' }}
            </h4>
            <div v-if="data.mediaType">
              {{ data.mediaType }}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
    <Button
      aria-label="Remove attachment"
      class="-right-1.5 -top-1.5 absolute h-6 w-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
      size="icon"
      type="button"
      variant="outline"
      @click="removeAttachment"
    >
      <XIcon class="h-3 w-3" />
    </Button>
  </div>
</template>
