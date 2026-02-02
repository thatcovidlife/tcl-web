<script setup lang="ts">
import { HoverCardContent } from '@/components/ui/hover-card'
</script>
<template>
  <HoverCardContent class="min-w-[240px] divide-y overflow-hidden p-0">
    <slot />
  </HoverCardContent>
</template>
