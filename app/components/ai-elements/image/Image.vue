<script setup lang="ts">
import { useAttrs } from 'vue'

defineProps<{
  alt: string
  base64: string
  mediaType: string
}>()

const attrs = useAttrs()
</script>
<template>
  <img
    alt="alt"
    class="h-auto max-w-full overflow-hidden rounded-md"
    :src="`data:${mediaType};base64,${base64}`"
    v-bind="attrs"
  />
</template>
