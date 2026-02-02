<script setup lang="ts">
import type { Tag, Target } from '@/lib/types'
import type { LATEST_PUBLICATIONS_QUERYResult } from '@/sanity/types'

defineProps<{
  articles:
    | LATEST_PUBLICATIONS_QUERYResult['library']
    | LATEST_PUBLICATIONS_QUERYResult['phw']
  target?: Target
}>()
</script>

<template>
  <div
    class="grid lg:grid-rows-4 lg:grid-cols-2 xl:grid-cols-3 lg:gap-x-12 gap-y-6 md:gap-y-8"
  >
    <template v-for="(article, index) in articles" :key="article.id">
      <TclPostCard
        v-if="index === 0"
        class="lg:row-span-4"
        :date="article.date"
        :description="article.description ? article.description : undefined"
        :limited="article.limited"
        :link="<string>article.link"
        :metadata="article.metadata"
        :premium="article.premium"
        :source="article.source || undefined"
        :tags="<Tag[]>article.tags"
        :target="target"
        :title="<string>article.title"
        :visual="article.visual"
      />
      <TclMedia
        v-else
        class="xl:col-span-2"
        :date="article.date"
        :description="article.description ? article.description : undefined"
        :limited="article.limited"
        :link="<string>article.link"
        :metadata="article.metadata"
        :premium="article.premium"
        :source="article.source || undefined"
        :tags="<Tag[]>article.tags"
        :target="target"
        :title="<string>article.title"
        :visual="article.visual"
      />
    </template>
  </div>
</template>
