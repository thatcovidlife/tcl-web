<script setup lang="ts">
import type { Tag, Target } from '@/lib/types'
import type { LATEST_PUBLICATIONS_QUERYResult } from '@/sanity/types'

defineProps<{
  link?: string
  seeAllLabel?: string
  target?: Target
  videos: LATEST_PUBLICATIONS_QUERYResult['videos']
}>()
</script>

<template>
  <Carousel
    class="relative w-full"
    :opts="{
      align: 'start',
    }"
    orientation="horizontal"
  >
    <CarouselContent class="-ml-6 md:-ml-8 lg:-ml-10 xl:-ml-12">
      <CarouselItem
        v-for="video in videos"
        :key="video.id"
        class="md:basis-1/2 xl:basis-1/3 h-auto pl-6 md:pl-8 lg:pl-10 xl:pl-12"
      >
        <TclPostCard
          class="h-full"
          :date="video.date"
          :description="video.description"
          :link="<string>video.link"
          :metadata="video.metadata"
          :tags="<Tag[]>video.tags"
          :target="target"
          :title="<string>video.title"
          :visual="video.visual"
        />
      </CarouselItem>
      <CarouselItem
        v-if="link && seeAllLabel"
        class="flex justify-center items-center md:basis-1/2 xl:basis-1/3 h-auto"
      >
        <TclMoreButton :label="seeAllLabel" :link="link" target="_self" />
      </CarouselItem>
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
  </Carousel>
</template>
