<script setup lang="ts">
defineProps<{
  description: string
  image?: string
  imageType?: string
  title: string
  type?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
}>()

const { locale, t } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()

// Construct canonical URL
const canonicalUrl = computed(() => {
  const baseUrl = config.public.siteUrl || 'https://thatcovid.life'
  return `${baseUrl}${route.path}`
})
</script>

<template>
  <Head>
    <Title>{{ title }}</Title>
    <Link rel="canonical" :href="canonicalUrl" />

    <!-- Standard Meta Tags -->
    <Meta name="description" :content="description" />
    <Meta v-if="author" name="author" :content="author" />

    <!-- OpenGraph Meta Tags -->
    <Meta property="og:title" :content="title" />
    <Meta property="og:description" :content="description" />
    <Meta property="og:type" :content="type || 'website'" />
    <Meta property="og:url" :content="canonicalUrl" />
    <Meta v-if="image" property="og:image" :content="image" />
    <Meta v-if="image" property="og:image:secure_url" :content="image" />
    <Meta v-if="imageType" property="og:image:type" :content="imageType" />
    <Meta v-if="image" property="og:image:width" content="1200" />
    <Meta v-if="image" property="og:image:height" content="630" />
    <Meta v-if="image" property="og:image:alt" :content="title" />
    <Meta property="og:locale" :content="locale" />
    <Meta property="og:site_name" :content="t('layout.tcl')" />

    <!-- Article-specific OpenGraph tags -->
    <Meta
      v-if="type === 'article' && publishedTime"
      property="article:published_time"
      :content="publishedTime"
    />
    <Meta
      v-if="type === 'article' && modifiedTime"
      property="article:modified_time"
      :content="modifiedTime"
    />
    <Meta
      v-if="type === 'article' && author"
      property="article:author"
      :content="author"
    />
    <Meta
      v-if="type === 'article' && section"
      property="article:section"
      :content="section"
    />
    <template v-if="type === 'article' && tags">
      <Meta
        v-for="tag in tags"
        :key="tag"
        property="article:tag"
        :content="tag"
      />
    </template>

    <!-- Twitter Card Meta Tags -->
    <Meta name="twitter:card" content="summary_large_image" />
    <Meta name="twitter:site" content="@thatcovidlife" />
    <Meta name="twitter:title" :content="title" />
    <Meta name="twitter:description" :content="description" />
    <Meta v-if="image" name="twitter:image" :content="image" />
    <Meta v-if="image" name="twitter:image:alt" :content="title" />
    <Meta
      v-if="author"
      name="twitter:creator"
      :content="author.startsWith('@') ? author : `@${author}`"
    />
  </Head>
</template>
