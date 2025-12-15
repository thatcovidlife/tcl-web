<script setup lang="ts">
import { motion } from 'motion-v'

const { locale, t } = useI18n()
const type = ref('bookmarks')
const loading = ref(false)
</script>
<template>
  <div class="container pt-4 md:pt-8">
    <TclSeo
      :description="t(`description.${type}`)"
      image="/tcl-fallback-169.jpg"
      image-type="image/jpeg"
      :title="t(`layout.${type}`)"
    />
    <div class="flex justify-between items-center">
      <div>
        <h1
          class="scroll-m-20 text-4xl font-extrabold lg:text-5xl font-title uppercase"
        >
          {{ t(`layout.${type}`) }}
        </h1>
        <h4
          class="scroll-m-20 text-base lg:text-xl font-semibold tracking-tight"
        >
          {{ t(`description.${type}`) }}
        </h4>
      </div>
      <!-- <TclFiltersSheet
        :locale="locale"
        :type="type"
        @update:filters="onUpdateFilters"
      /> -->
    </div>
    <section class="my-4 md:my-8">
      <TclLoader v-if="loading" />
      <motion.div
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        class="grid gap-4 md:gap-8 py-4 md:py-8"
        v-else
      >
        <ClientOnly>
          <!-- <TclMedia
            v-for="article in results"
            :key="article.id"
            :date="hasDate ? article.date : null"
            :end="article.end"
            :description="article.description"
            :free="article.free"
            :link="<string>(article.link || article.url || '')"
            :limited="article.limited"
            :metadata="article.metadata"
            :premium="article.premium"
            :source="article.source ? (article.source as string) : undefined"
            :tags="<Tag[]>article.tags"
            :target="isExternalLink(article.type) ? '_blank' : '_self'"
            :title="<string>article.title"
            :visual="article.visual"
          /> -->
        </ClientOnly>
      </motion.div>
      <!-- <TclPagination
        v-if="total"
        :initial-page="currentPage"
        :limit="limit"
        :total="total"
        @page:change="onPageChange"
      /> -->
    </section>
  </div>
</template>
