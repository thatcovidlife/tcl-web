<template>
  <figure>
    <video controls :src="videoUrl" style="width: 100%; max-width: 100%" />
    <figcaption
      v-if="props.caption"
      class="text-center text-muted-foreground text-xs font-sans mt-3 mb-3"
    >
      {{ props.caption }}
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
import { sanityFileUrl } from '@/assets/utils/sanity-file-url'

const props = defineProps<{
  caption?: string
  video: {
    asset: {
      _ref: string
    }
  }
}>()

const videoUrl = sanityFileUrl(props.video.asset._ref)
</script>
