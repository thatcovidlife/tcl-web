<script setup lang="ts">
import { CarouselContent } from '@/components/ui/carousel'

defineOptions({ name: 'InlineCitationCarouselContent' })
</script>

<template>
  <CarouselContent>
    <slot />
  </CarouselContent>
</template>
