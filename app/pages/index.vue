<script setup lang="ts">
import { motion } from 'motion-v'
import type { Tag } from '@/lib/types'
import LATEST_PUBLICATIONS_QUERY from '@/sanity/queries/latestPublications.sanity'
import type { LATEST_PUBLICATIONS_QUERYResult } from '@/sanity/types'
import * as Sentry from '@sentry/nuxt'

// const host = computed(() => window?.location?.origin || '')
const { locale, t } = useI18n()
const localePath = useLocalePath()

const { data, status } = await Sentry.startSpan(
  {
    name: 'fetch latest publications',
    op: 'sanity.query',
  },
  async () => {
    return await useLazySanityQuery<LATEST_PUBLICATIONS_QUERYResult>(
      LATEST_PUBLICATIONS_QUERY,
      { locale },
    )
  },
)

const loading = computed(
  () => status?.value === 'pending' || status?.value === 'idle',
)
// const error = computed(() => status?.value === 'error')

const events = computed(() => data?.value?.events || [])
const library = computed(() => data?.value?.library || [])
const news = computed(() => data?.value?.news || [])
const phw = computed(() => data?.value?.phw || [])
const showcase = computed(() => data?.value?.showcase || [])
const videos = computed(() => data?.value?.videos || [])
</script>

<template>
  <motion.div
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    class="flex flex-col justify-center items-center"
  >
    <TclSeo
      :description="t('layout.description')"
      image="/tcl-fallback-169.jpg"
      image-type="image/jpeg"
      :title="t('layout.home')"
    />

    <TclLoader v-if="loading" />

    <template v-else>
      <!-- SHOWCASE -->
      <motion.div
        class="w-full"
        :initial="{ opacity: 0 }"
        :whileInView="{ opacity: 1 }"
      >
        <TclShowcase
          class="container mx-auto my-4 md:my-8 lg:my-12"
          :docs="showcase"
        />
      </motion.div>

      <!-- NEWS -->
      <motion.div
        :initial="{ opacity: 0 }"
        :whileInView="{ opacity: 1 }"
        class="container"
      >
        <h2
          class="font-title scroll-m-20 text-4xl font-extrabold lg:text-5xl uppercase"
        >
          {{ t('home.latestNews') }}
        </h2>

        <div
          class="grid md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 lg:gap-10 xl:gap-12 py-6 md:py-12"
        >
          <TclPostCard
            v-for="article in news"
            :key="article.id"
            :date="article.date"
            :limited="article.limited"
            :link="<string>article.link"
            :metadata="article.metadata"
            :premium="article.premium"
            :source="<string>article.source"
            :tags="<Tag[]>article.tags"
            target="_blank"
            :title="<string>article.title"
            :visual="article.visual"
          />
        </div>

        <div class="md:flex md:justify-center pb-6 md:pb-12">
          <TclMoreButton
            extra="w-full md:w-auto"
            :label="t('home.seeAllNews')"
            :link="localePath('/news?offset=0&limit=5')"
            target="_self"
          />
        </div>
      </motion.div>

      <!-- EVENTS -->
      <motion.div
        :initial="{ opacity: 0 }"
        :whileInView="{ opacity: 1 }"
        v-if="events.length"
        class="bg-foreground w-full"
      >
        <div class="container py-6 md:py-12">
          <h2
            class="font-title scroll-m-20 text-4xl font-extrabold lg:text-5xl text-background uppercase"
          >
            {{ t('home.events') }}
          </h2>
          <div
            class="grid md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 lg:gap-10 xl:gap-12 py-6 md:py-12"
          >
            <TclPostCard
              v-for="event in events"
              :key="event.id"
              class="bg-muted"
              :date="event.date"
              :end="event.end"
              :description="event.description"
              :free="event.free"
              :link="<string>event.link"
              :metadata="event.metadata"
              :tags="<Tag[]>event.tags"
              target="_self"
              :title="<string>event.title"
              :visual="event.visual"
            />
          </div>
          <div class="md:flex md:justify-center">
            <TclMoreButton
              extra="w-full md:w-auto"
              :label="t('home.seeAllEvents')"
              :link="localePath('/event?offset=0&limit=5')"
              target="_self"
            />
          </div>
        </div>
      </motion.div>

      <!-- VIDEOS -->
      <motion.div
        :initial="{ opacity: 0 }"
        :whileInView="{ opacity: 1 }"
        class="bg-muted w-full"
      >
        <div class="container py-6 md:py-12">
          <h2
            class="font-title scroll-m-20 text-4xl font-extrabold lg:text-5xl uppercase"
          >
            {{ t('home.videos') }}
          </h2>
          <div
            class="flex flex-col w-full justify-center items-center pt-6 md:pt-12"
          >
            <TclVideoCarousel
              class="hidden md:block max-w-[calc(100%-100px)] 2xl:max-w-full"
              :link="localePath('/video?offset=0&limit=5')"
              :see-all-label="t('home.seeAllVideos')"
              :videos="videos"
            />
            <div class="md:hidden grid gap-6 mb-6 w-full">
              <TclPostCard
                v-for="video in videos"
                :key="video.id"
                :date="video.date"
                :description="video.description"
                :link="<string>video.link"
                :metadata="video.metadata"
                :tags="<Tag[]>video.tags"
                target="_self"
                :title="<string>video.title"
                :visual="video.visual"
              />
            </div>
            <div class="w-full md:hidden">
              <TclMoreButton
                extra="w-full"
                :label="t('home.seeAllVideos')"
                :link="localePath('/video?offset=0&limit=5')"
                target="_self"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <!-- PHW & LIBRARY -->
      <div class="container py-6 md:py-12">
        <motion.div :initial="{ opacity: 0 }" :whileInView="{ opacity: 1 }">
          <h2
            class="font-title scroll-m-20 text-4xl font-extrabold lg:text-5xl uppercase"
          >
            {{ t('home.library') }}
          </h2>
          <TclArticleBlock :articles="library" class="py-6 md:py-12" />
          <div class="md:flex md:justify-center pb-6 md:pb-12">
            <TclMoreButton
              extra="w-full md:w-auto"
              :label="t('home.seeAllLibrary')"
              :link="localePath('/scientific-library?offset=0&limit=5')"
              target="_self"
            />
          </div>
        </motion.div>
        <motion.div :initial="{ opacity: 0 }" :whileInView="{ opacity: 1 }">
          <h2
            class="font-title scroll-m-20 text-4xl font-extrabold lg:text-5xl uppercase"
          >
            {{ t('home.phw') }}
          </h2>
          <TclArticleBlock
            :articles="phw"
            class="py-6 md:py-12"
            target="_blank"
          />
          <div class="md:flex md:justify-center pb-6 md:pb-12">
            <TclMoreButton
              extra="w-full md:w-auto"
              :label="t('home.seeAllPhw')"
              :link="localePath('/public-health?offset=0&limit=5')"
              target="_self"
            />
          </div>
        </motion.div>
      </div>
    </template>
  </motion.div>
</template>
