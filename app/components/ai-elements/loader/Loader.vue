<script setup lang="ts">
import LoaderIcon from './LoaderIcon.vue'

defineProps<{
  size?: number
}>()
</script>
<template>
  <div class="inline-flex animate-spin items-center justify-center">
    <LoaderIcon :size="size" />
  </div>
</template>
