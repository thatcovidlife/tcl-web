<script setup lang="ts">
import { useBranch } from './branch-context'

const { currentBranch, totalBranches } = useBranch()
</script>

<template>
  <span class="font-medium text-muted-foreground text-xs tabular-nums">
    {{ currentBranch + 1 }} of {{ totalBranches }}
  </span>
</template>
