<script lang="ts" setup>
import { format } from 'date-fns'
import { convertTs } from '@/assets/utils/convert-timestamp'
import { getDateLocale } from '@/assets/constants/date-locales'
import { LOCALIZED_DATE_FORMAT } from '@/assets/constants/date-formats'
import { useStatsig } from '@/composables/useStatsig'

import { isProduct } from '@/assets/utils/article-types'

type Brand = {
  name: string | null
  url: string | null
  path: string | null
} | null

defineProps<{
  brand?: Brand
  date?: string | null
  end?: string | null
  location?: string | null
  source?: string | null
  title: string
  type: string
}>()

const { locale } = useI18n()
const { statsig } = useStatsig()
const localePath = useLocalePath()

const url = computed(() => {
  return `${location?.origin}${useRoute().fullPath}`
})
</script>
<template>
  <div>
    <h1
      class="font-pt antialiased text-4xl leading-[42px] font-bold mb-4 md:mb-8"
    >
      {{ title }}
    </h1>
    <NuxtLink
      v-if="isProduct(type) && brand?.name"
      class="antialiased text-sm uppercase tracking-widest mb-2 hover:text-primary transition-colors"
      :to="localePath(<string>brand.path)"
      >{{ brand.name }}</NuxtLink
    >
    <h2
      v-if="date || source || location"
      class="flex flex-col md:flex-row gap-1 antialiased text-sm uppercase tracking-widest mb-2"
    >
      <span v-if="date">{{
        format(convertTs(date), LOCALIZED_DATE_FORMAT, {
          locale: getDateLocale(locale),
        })
      }}</span>
      <span v-if="date && end" class="hidden md:flex mx-1">-</span>
      <span v-if="end">
        {{
          format(convertTs(end), LOCALIZED_DATE_FORMAT, {
            locale: getDateLocale(locale),
          })
        }}
      </span>
      <span v-if="date && source" class="hidden md:flex">|</span>
      <span v-if="source">{{ source }}</span>
      <span v-if="location">{{ location }}</span>
    </h2>
    <Separator class="my-4" />
    <div class="mb-2 flex gap-3">
      <TclShare :title="title" :url="url" />
      <TclBookmark v-if="statsig?.checkGate('bookmarks_enabled')" />
    </div>
  </div>
</template>
