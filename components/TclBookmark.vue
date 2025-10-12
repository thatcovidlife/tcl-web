<script setup lang="ts">
import { BookmarkPlus } from 'lucide-vue-next'

const { t } = useI18n()
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button size="icon" variant="outline" class="rounded-full">
          <BookmarkPlus />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{{ t('bookmarks.tooltip') }}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
