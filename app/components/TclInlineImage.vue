<script setup lang="ts">
defineProps<{
  asset?: {
    _ref?: string
  }
}>()
</script>

<template>
  <SanityImage class="max-w-full mx-auto my-5" :asset-id="asset?._ref" />
</template>
