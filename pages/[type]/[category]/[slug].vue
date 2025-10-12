<script lang="ts" setup>
import { motion } from 'motion-v'
import { SERIALIZERS } from '@/assets/constants/serializers'
import PUBLICATION_QUERY from '@/sanity/queries/publication.sanity'
import METADATA_QUERY from '@/sanity/queries/metadata.sanity'
import {
  isBrand,
  isCovidnet,
  isDirectory,
  isProduct,
  isResource,
  isVideo,
} from '@/assets/utils/article-types'
import { useCovidnet } from '@/composables/useCovidnet'
import type {
  METADATA_QUERYResult,
  PUBLICATION_QUERYResult,
} from '@/sanity/types'
import type { FeaturedPost, Tag } from '@/lib/types'
import { convertTs } from '@/assets/utils/convert-timestamp'
import * as Sentry from '@sentry/nuxt'

const route = useRoute()
const { locale, t } = useI18n()
const {
  COVIDNET_TYPES,
  getChannelFeed,
  getFeaturedContent,
  hasFeaturedContent,
  isFeaturedContentLoading,
} = useCovidnet()

const { category, slug, type } = route.params

const { data: metadata } = await Sentry.startSpan(
  {
    name: 'fetch publication metadata',
    op: 'sanity.query',
  },
  async () => {
    return await useLazySanityQuery<METADATA_QUERYResult>(METADATA_QUERY, {
      category,
      locale,
      slug,
      type,
    })
  },
)

const pageTitle = computed(
  () => metadata?.value?.title || metadata?.value?.name || '',
)
const pageDescription = computed(
  () => metadata?.value?.description || t('home.description'),
)
const ogImage = computed(() =>
  metadata?.value?.image
    ? `${metadata.value.image}?crop=entropy&fit=crop&h=450&w=800`
    : '/tcl-fallback-169.jpg',
)
const ogImageType = computed(() => {
  const extension =
    ogImage?.value?.split('.')?.pop()?.split('?').shift() || 'jpeg'
  return `image/${extension}`
})

const location = computed(() => {
  if (!article?.value?.info?.city || !article?.value?.info?.country) {
    return null
  }

  return `${article.value.info.city}, ${article.value.info.country}`
})

const { data: article, status } = await Sentry.startSpan(
  {
    name: 'fetch publication',
    op: 'sanity.query',
  },
  async () => {
    return await useLazySanityQuery<PUBLICATION_QUERYResult>(
      PUBLICATION_QUERY,
      {
        category,
        locale,
        slug,
        type,
      },
    )
  },
)

const channelFeed = await useAsyncData(
  'channelFeed',
  () => {
    return isCovidnet(<string>type) && article?.value?.covidnet?.channelID
      ? getChannelFeed(article.value.covidnet.channelID)
      : Promise.resolve([])
  },
  { watch: [article] },
)
const channelVideos = computed(() => channelFeed?.data?.value || [])

const ftdPosts = await useAsyncData(
  'ftdPosts',
  () => {
    return isCovidnet(<string>type) &&
      article?.value?.covidnet &&
      hasFeaturedContent(<Record<string, any>>article?.value?.covidnet)
      ? // @ts-expect-error type
        getFeaturedContent(article?.value?.covidnet)
      : Promise.resolve([])
  },
  { watch: [article] },
)
const featuredPosts = computed(() => ftdPosts?.data?.value || [])

const loading = computed(
  () => status?.value === 'pending' || status?.value === 'idle',
)

const hasReadMoreButton = computed(() => !isVideo(type as string))
const hasSplash = computed(
  () =>
    !isBrand(type as string) &&
    !isCovidnet(type as string) &&
    !isDirectory(type as string) &&
    !isProduct(type as string) &&
    !isResource(type as string) &&
    !isVideo(type as string),
)
</script>

<template>
  <div class="container max-w-3xl py-4 md:py-8">
    <TclSeo
      :description="pageDescription"
      :image="ogImage"
      :image-type="ogImageType"
      :title="<string>pageTitle"
    />
    <TclLoader v-if="loading" />
    <motion.div :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" v-else>
      <TclArticleHeader
        v-if="article"
        class="mb-4 md:mb-10"
        :brand="article?.brand"
        :date="<string | null>article.date"
        :end="<string | null>article.end"
        :location="location"
        :source="<string | null>article.source"
        :title="
          isBrand(<string>type) ? <string>article.name : <string>article.title
        "
        :type="<string>type"
      />
      <section class="font-pt text-lg">
        <SanityImage
          v-if="hasSplash && article?.thumbnail"
          :alt="article.title"
          :asset-id="article.thumbnail"
          :w="768"
          class="w-full h-auto rounded-xl mb-8"
        />
        <div
          class="video-container rounded-xl overflow-hidden bg-muted mb-8 aspect-video"
          v-html="article.embedCode"
          v-if="isVideo(<string>type) && article?.embedCode"
        />
        <div class="article-body">
          <SanityContent
            v-if="article?.body"
            :blocks="<any>article?.body"
            :serializers="SERIALIZERS"
          />
        </div>
      </section>
      <section v-if="article?.link" class="py-2 flex gap-4">
        <TclMoreButton
          v-if="hasReadMoreButton"
          :label="t('article.readMore')"
          :link="<string>article.link"
          target="_blank"
        />
        <TclMoreButton
          v-if="isVideo(<string>type) && !article?.embedCode"
          :label="t('article.watchVideo')"
          :link="<string>article.link"
          target="_blank"
        />
        <TclMoreButton
          v-if="isProduct(<string>type) && article?.brand"
          :label="t('article.manufacturerWebsite')"
          :link="<string>article.brand?.url"
          target="_blank"
        />
      </section>
      <section v-if="isCovidnet(type as string)" class="py-2 flex gap-4">
        <TclMoreButton
          v-if="article?.covidnet?.contentType === COVIDNET_TYPES.BLOG"
          :label="t('covidnet.blog.link')"
          :link="<string>article?.covidnet?.blogURL"
          target="_blank"
        />
        <TclMoreButton
          v-if="article?.covidnet?.contentType === COVIDNET_TYPES.YOUTUBE"
          :label="t('covidnet.videos.channel')"
          :link="<string>article?.covidnet?.channelURL"
          target="_blank"
        />
      </section>
      <section
        v-if="article?.tags?.length"
        class="flex flex-wrap gap-2 pt-2 md:pt-4"
      >
        <TclTagList
          :free="article?.free"
          :limited="article?.limited"
          :online="article?.onlineOnly"
          :premium="article?.premium"
          :tags="<Tag[]>article.tags"
        />
      </section>

      <!-- DIRECTORY: CONTACT INFO -->
      <template v-if="isDirectory(type as string) && article?.info">
        <Separator class="my-8" />
        <section class="grid gap-4 md:gap-8">
          <h2 class="font-pt text-2xl font-semibold uppercase tracking-widest">
            {{ t('article.contactInfo') }}
          </h2>
          <div
            class="grid gap-4 md:flex justify-between font-pt leading-relaxed text-lg"
          >
            <div>
              <div v-text="article?.title" class="font-bold" />
              <div
                v-if="article?.info?.street1"
                v-text="article?.info?.street1"
              />
              <div
                v-if="article?.info?.street2"
                v-text="article?.info?.street2"
              />
              <div v-if="article?.info?.city" v-text="article?.info?.city" />
              <div
                v-if="article?.info?.zipCode"
                v-text="article?.info?.zipCode"
              />
              <div
                v-if="article?.info?.country"
                v-text="article?.info?.country"
              />
            </div>
            <div class="md:text-right">
              <div v-if="article?.info?.phone">
                <NuxtLink
                  :href="`tel:${article?.info?.phone}`"
                  class="hover:text-primary transition-colors"
                  >{{ article?.info?.phone }}</NuxtLink
                >
              </div>
              <div v-if="article?.info?.email">
                <NuxtLink
                  :href="`mailto:${article?.info?.email}`"
                  class="hover:text-primary transition-colors"
                  >{{ article?.info?.email }}</NuxtLink
                >
              </div>
              <div v-if="article?.info?.website">
                <NuxtLink
                  :href="article?.info?.website"
                  target="_blank"
                  class="hover:text-primary transition-colors"
                  >{{ article?.info?.website }}</NuxtLink
                >
              </div>
            </div>
          </div>
        </section>
      </template>

      <!-- DIRECTORY: DIRECTIONS -->
      <template v-if="isDirectory(type as string) && article?.location">
        <Separator class="my-8" />
        <section class="grid gap-4 md:gap-8">
          <h2 class="font-pt text-2xl font-semibold uppercase tracking-widest">
            {{ t('article.directions') }}
          </h2>
          <div class="aspect-video w-full overflow-hidden rounded-xl">
            <LMap
              :zoom="6"
              :center="[
                <number>article.location.lat,
                <number>article.location.lng,
              ]"
              :use-global-leaflet="false"
            >
              <LTileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&amp;copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                layer-type="base"
                name="OpenStreetMap"
              />
              <LMarker
                :lat-lng="[
                  <number>article.location.lat,
                  <number>article.location.lng,
                ]"
              />
            </LMap>
          </div>
        </section>
      </template>

      <!-- COVIDNET: BLOG -->
      <template
        v-if="
          isCovidnet(type as string) &&
          article?.contentType === COVIDNET_TYPES.BLOG &&
          hasFeaturedContent(<Record<string, any>>article?.covidnet)
        "
      >
        <Separator class="my-8" />
        <TclLoader v-if="isFeaturedContentLoading" />
        <section class="grid gap-4 md:gap-8">
          <h2 class="font-pt text-2xl font-semibold uppercase tracking-widest">
            {{ t('covidnet.blog.featured') }}
          </h2>
          <TclMedia
            v-for="post in <FeaturedPost[]>featuredPosts"
            :key="post.id"
            :date="post.date ? convertTs(post.date) : null"
            :description="post.description ? `${post.description}...` : ''"
            :link="<string>post.url"
            :source="<string>article?.title"
            :title="<string>post.title"
          />
        </section>
      </template>

      <!-- COVIDNET: YOUTUBE -->
      <template
        v-if="
          isCovidnet(type as string) &&
          article?.contentType === COVIDNET_TYPES.YOUTUBE &&
          article?.covidnet?.channelID
        "
      >
        <Separator class="my-8" />
        <section class="grid gap-4 md:gap-8">
          <h2 class="font-pt text-2xl font-semibold uppercase tracking-widest">
            {{ t('covidnet.videos.latest') }}
          </h2>
          <TclMedia
            v-for="video in channelVideos"
            :key="video.id"
            :date="video.date"
            :description="video.description ? `${video.description}...` : ''"
            :link="<string>video.url"
            :source="COVIDNET_TYPES.YOUTUBE"
            :thumbnail="video.thumbnail"
            :title="<string>video.title"
          />
        </section>
      </template>

      <!-- LISTED PRODUCTS -->
      <template v-if="isBrand(<string>type) && article?.products?.length">
        <Separator class="my-8" />
        <section class="grid gap-4 md:gap-8">
          <h2 class="font-pt text-2xl font-semibold uppercase tracking-widest">
            {{ t('article.listedProducts') }}
          </h2>
          <TclMedia
            v-for="product in article?.products"
            :key="product.id"
            :description="
              product.description ? `${product.description}...` : ''
            "
            :link="<string>product.url"
            :tags="<Tag[]>product.tags"
            :title="<string>product.title"
            :visual="<string>product.visual"
          />
        </section>
      </template>

      <!-- RELATED ARTICLES -->
      <template v-if="article?.related?.length">
        <Separator class="my-8" />
        <section class="grid gap-4 md:gap-8">
          <h2 class="font-pt text-2xl font-semibold uppercase tracking-widest">
            {{ t('article.related') }}
          </h2>
          <TclMedia
            v-for="related in article?.related"
            :key="related.id"
            :description="
              related.description ? `${related.description}...` : ''
            "
            :link="<string>related.url"
            :tags="<Tag[]>related.tags"
            :title="<string>related.title"
            :visual="<string>related.visual"
          />
        </section>
      </template>
    </motion.div>
  </div>
</template>
