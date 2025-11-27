<script setup lang="ts">
defineProps<{
  id: string
}>()
</script>

<template>
  <span
    class="inline-flex items-center cursor-pointer bg-muted px-1 rounded text-xs text-red-500 border border-red-500 hover:bg-red-500/10"
  >
    <!-- {{ id.slice(0, 6) }} -->
    TCL CITATION
  </span>
</template>
