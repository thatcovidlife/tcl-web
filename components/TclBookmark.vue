<script setup lang="ts">
import { BookmarkMinus, BookmarkPlus } from 'lucide-vue-next'

defineProps<{
  bookmarked?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()

const { t } = useI18n()
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          size="icon"
          variant="outline"
          class="rounded-full"
          @click="emit('toggle')"
        >
          <BookmarkMinus v-if="bookmarked" />
          <BookmarkPlus v-else />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{{ bookmarked ? t('bookmarks.remove') : t('bookmarks.add') }}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
