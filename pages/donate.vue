<script setup lang="ts">
import { motion } from 'motion-v'
import {
  ArrowUpRight,
  Coffee,
  HeartHandshake,
  Server,
  ShieldCheck,
  Smartphone,
  Newspaper,
} from 'lucide-vue-next'

const { t } = useI18n()

const oneTimeUrl = 'https://ko-fi.com/thatcovidlife'
const monthlyUrl = 'https://ko-fi.com/thatcovidlife/tiers'

const supportOptions = computed(() => [
  {
    id: 'one-time',
    icon: Coffee,
    title: t('donate.oneTime.title'),
    description: t('donate.oneTime.description'),
    cta: t('donate.oneTime.cta'),
    href: oneTimeUrl,
  },
  {
    id: 'monthly',
    icon: HeartHandshake,
    title: t('donate.monthly.title'),
    description: t('donate.monthly.description'),
    cta: t('donate.monthly.cta'),
    href: monthlyUrl,
  },
])

const impactItems = computed(() => [
  {
    id: 'hosting',
    icon: Server,
    title: t('donate.impact.hosting.title'),
    description: t('donate.impact.hosting.description'),
  },
  {
    id: 'mobile',
    icon: Smartphone,
    title: t('donate.impact.mobile.title'),
    description: t('donate.impact.mobile.description'),
  },
  {
    id: 'curation',
    icon: Newspaper,
    title: t('donate.impact.curation.title'),
    description: t('donate.impact.curation.description'),
  },
])
</script>

<template>
  <motion.div
    :initial="{ opacity: 0, y: 16 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.45 }"
    class="bg-background"
  >
    <TclSeo
      :description="t('donate.meta.description')"
      image="/tcl-fallback-169.jpg"
      image-type="image/jpeg"
      :title="t('donate.meta.title')"
    />

    <section class="container py-8 md:py-12 lg:py-14">
      <div
        class="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.85fr)] lg:items-start"
      >
        <div class="space-y-6 lg:sticky lg:top-24">
          <Badge
            variant="outline"
            class="gap-2 rounded-full border-primary/20 bg-primary/5 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary"
          >
            {{ t('donate.eyebrow') }}
          </Badge>

          <div class="space-y-4">
            <h1
              class="max-w-[13ch] font-pt text-[clamp(2.65rem,5vw,5rem)] font-semibold leading-[0.96] text-foreground"
            >
              {{ t('donate.title') }}
            </h1>
            <p
              class="max-w-[64ch] text-base leading-7 text-muted-foreground md:text-lg md:leading-8"
            >
              {{ t('donate.description') }}
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <article
              v-for="option in supportOptions"
              :key="option.id"
              class="flex min-h-[220px] flex-col justify-between rounded-lg border border-border bg-muted/30 p-4"
            >
              <div class="space-y-3">
                <div
                  class="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground"
                >
                  <component :is="option.icon" :size="20" aria-hidden="true" />
                </div>
                <div class="space-y-2">
                  <h2 class="font-pt text-2xl font-semibold leading-tight">
                    {{ option.title }}
                  </h2>
                  <p class="text-sm leading-6 text-muted-foreground">
                    {{ option.description }}
                  </p>
                </div>
              </div>

              <Button
                as-child
                class="mt-5 h-auto min-h-10 w-full whitespace-normal px-3 py-2.5 text-center"
              >
                <NuxtLink
                  :to="option.href"
                  external
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ option.cta }}
                  <ArrowUpRight :size="16" aria-hidden="true" />
                </NuxtLink>
              </Button>
            </article>
          </div>

          <div
            class="flex items-start gap-3 rounded-lg border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground"
          >
            <ShieldCheck
              :size="20"
              class="mt-0.5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p>{{ t('donate.trustNote') }}</p>
          </div>
        </div>

        <aside :aria-label="t('donate.panel.ariaLabel')">
          <div class="mx-auto w-full max-w-[25rem] space-y-4">
            <div class="space-y-2">
              <h2 class="font-pt text-3xl font-semibold leading-tight">
                {{ t('donate.panel.title') }}
              </h2>
              <p class="text-sm leading-6 text-muted-foreground">
                {{ t('donate.panel.description') }}
              </p>
            </div>
            <TclKofiTipPanel />
          </div>
        </aside>
      </div>
    </section>

    <section class="border-y bg-muted/30">
      <div class="container grid gap-6 py-8 md:grid-cols-3 md:py-10">
        <article v-for="item in impactItems" :key="item.id" class="space-y-3">
          <div
            class="flex size-10 items-center justify-center rounded-md border border-border bg-background text-primary"
          >
            <component :is="item.icon" :size="20" aria-hidden="true" />
          </div>
          <div class="space-y-1.5">
            <h2 class="text-sm font-semibold uppercase tracking-[0.18em]">
              {{ item.title }}
            </h2>
            <p class="text-sm leading-6 text-muted-foreground">
              {{ item.description }}
            </p>
          </div>
        </article>
      </div>
    </section>
  </motion.div>
</template>
