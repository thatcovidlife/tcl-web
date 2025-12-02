<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ChevronRightIcon } from 'lucide-vue-next'
import { useBranch } from './branch-context'

const { goToNext, totalBranches } = useBranch()
</script>

<template>
  <Button
    aria-label="Next branch"
    class="size-7 shrink-0 rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
    :disabled="totalBranches <= 1"
    variant="outline"
    @click="goToNext"
    type="button"
  >
    <slot>
      <ChevronRightIcon :size="14" />
    </slot>
  </Button>
</template>
