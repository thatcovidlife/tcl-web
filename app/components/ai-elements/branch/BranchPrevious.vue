<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon } from 'lucide-vue-next'
import { useBranch } from './branch-context'

const { goToPrevious, totalBranches } = useBranch()
</script>

<template>
  <Button
    aria-label="Previous branch"
    class="size-7 shrink-0 rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
    :disabled="totalBranches <= 1"
    variant="outline"
    @click="goToPrevious"
    type="button"
  >
    <slot>
      <ChevronLeftIcon :size="14" />
    </slot>
  </Button>
</template>
