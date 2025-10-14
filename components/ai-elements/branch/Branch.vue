<script setup lang="ts">
import { provideBranch } from './branch-context'

const props = defineProps<{
  defaultBranch: number
  onBranchChange: (branch: number) => void
}>()

provideBranch({
  defaultBranch: props.defaultBranch,
  onBranchChange: props.onBranchChange,
})
</script>
<template>
  <div class="grid w-full gap-2 [&>div]:pb-0">
    <slot />
  </div>
</template>
