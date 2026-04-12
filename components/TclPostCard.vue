<script setup lang="ts">
import { format } from 'date-fns'
import { convertTs } from '@/assets/utils/convert-timestamp'
import type { Tag, Target } from '@/lib/types'
import { getDateLocale } from '@/assets/constants/date-locales'
import { LOCALIZED_DATE_FORMAT } from '@/assets/constants/date-formats'

const props = defineProps<{
  date?: Date | string | null
  description?: string
  end?: Date | string | null
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
  <Card
    class="group overflow-hidden border-border/70 bg-card shadow-none transition-colors duration-200 hover:border-primary/25"
  >
    <NuxtLink
      :to="target === '_blank' ? link : localePath(link)"
      :target="target"
    >
      <CardHeader class="overflow-hidden p-0 pb-5">
        <SanityImage
          v-if="visual"
          :alt="title"
          :asset-id="visual"
          class="w-full transition-transform duration-300 group-hover:scale-[1.02]"
          fit="crop"
          crop="entropy"
          :h="450"
          :w="800"
        />
        <NuxtImg v-else src="/tcl-fallback-169.jpg" :alt="title" />
      </CardHeader>
    </NuxtLink>
    <CardContent class="space-y-3">
      <h3 class="font-title text-[1.7rem] leading-8 tracking-[-0.03em]">
        <NuxtLink
          class="transition-colors duration-200 hover:text-primary"
          :to="target === '_blank' ? link : localePath(link)"
          :target="target"
        >
          {{ title }}
        </NuxtLink>
      </h3>
      <h4
        v-if="publicationDate"
        class="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
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
    </CardContent>
    <CardFooter v-if="tags?.length">
      <TclTagList
        :free="free"
        :limited="limited"
        :premium="premium"
        :tags="tags"
      />
    </CardFooter>
  </Card>
</template>
