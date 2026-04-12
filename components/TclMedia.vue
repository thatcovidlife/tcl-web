<script setup lang="ts">
import { format } from 'date-fns'
import { convertTs } from '@/assets/utils/convert-timestamp'
import type { Tag, Target } from '@/lib/types'
import { getDateLocale } from '@/assets/constants/date-locales'
import { LOCALIZED_DATE_FORMAT } from '@/assets/constants/date-formats'

const props = defineProps<{
  date?: Date | string | null
  end?: Date | string | null
  description?: string
  free?: boolean
  link: string
  limited?: boolean
  metadata?: {
    aspectRatio: number | null
    height: number | null
    width: number | null
  } | null
  premium?: boolean
  source?: string
  tags?: Tag[]
  target?: Target
  thumbnail?: string
  title: string
  visual?: string | null
}>()

const { locale } = useI18n()
const localePath = useLocalePath()

const publicationDate = computed(() => {
  if (!props.date) return null

  return props.date.toString().split('T').length === 1
    ? convertTs(props.date as string)
    : props.date
})

const endDate = computed(() => {
  if (!props.end) return null

  return convertTs(props.end as string)
})
</script>

<template>
  <div class="flex min-w-0 xl:col-span-2">
    <NuxtLink
      class="hidden xl:mr-8 xl:block xl:w-[180px] xl:shrink-0 2xl:w-[240px]"
      :to="target === '_blank' ? link : localePath(link)"
      :target="target"
    >
      <SanityImage
        v-if="visual"
        :alt="title"
        :asset-id="visual"
        class="rounded-lg"
        fit="crop"
        crop="entropy"
        :h="135"
        :w="240"
      />
      <NuxtImg
        v-else-if="thumbnail"
        :src="thumbnail"
        class="rounded-lg"
        :alt="title"
      />
      <NuxtImg
        v-else
        src="/tcl-fallback-169.jpg"
        class="rounded-lg"
        :height="135"
        :width="240"
        :alt="title"
      />
    </NuxtLink>
    <div class="min-w-0">
      <h2
        class="mb-3 font-title text-[1.45rem] leading-7 tracking-[-0.025em] text-foreground"
      >
        <NuxtLink
          class="transition-colors duration-200 hover:text-primary"
          :to="target === '_blank' ? link : localePath(link)"
          :target="target"
        >
          {{ title }}
        </NuxtLink>
      </h2>
      <h4
        v-if="publicationDate"
        class="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
      >
        <span v-if="source">{{ source }} | </span>
        <span
          >{{
            format(publicationDate, LOCALIZED_DATE_FORMAT, {
              locale: getDateLocale(locale),
            })
          }}
        </span>
        <span v-if="publicationDate && endDate" class="mx-1">-</span>
        <span v-if="endDate">
          {{
            format(endDate, LOCALIZED_DATE_FORMAT, {
              locale: getDateLocale(locale),
            })
          }}
        </span>
      </h4>
      <p v-if="description" class="text-sm leading-6 text-muted-foreground">
        {{ description }}
      </p>
      <TclTagList
        v-if="tags?.length"
        class="mt-4"
        :free="free"
        :limited="limited"
        :premium="premium"
        :tags="<Tag[]>tags"
      />
    </div>
  </div>
</template>
