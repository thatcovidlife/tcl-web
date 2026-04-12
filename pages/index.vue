<script setup lang="ts">
import { motion } from 'motion-v'
import type { Tag } from '@/lib/types'
import LATEST_PUBLICATIONS_QUERY from '@/sanity/queries/latestPublications.sanity'
import type {
  LATEST_PUBLICATIONS_QUERYResult,
  PROMO_QUERYResult,
} from '@/sanity/types'
import PROMO_QUERY from '@/sanity/queries/promo.sanity'
import * as Sentry from '@sentry/nuxt'

const { loggedIn } = useUserSession()
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

const { data: promoData } = await Sentry.startSpan(
  {
    name: 'fetch promo',
    op: 'sanity.query',
  },
  async () => {
    return await useLazySanityQuery<PROMO_QUERYResult>(PROMO_QUERY, { locale })
  },
)

const loading = computed(
  () => status?.value === 'pending' || status?.value === 'idle',
)

const events = computed(() => data?.value?.events || [])
const library = computed(() => data?.value?.library || [])
const news = computed(() => data?.value?.news || [])
const phw = computed(() => data?.value?.phw || [])
const showcase = computed(() => data?.value?.showcase || [])
const videos = computed(() => data?.value?.videos || [])
const promo = computed(() => promoData?.value || [])

const primaryStories = computed(() =>
  [...news.value.slice(0, 2), ...phw.value.slice(0, 1)].slice(0, 3),
)

const reportingStories = computed(() => news.value.slice(0, 4))
const watchStories = computed(() => phw.value.slice(0, 3))
const upcomingEvents = computed(() => events.value.slice(0, 3))

const guidedQuestions = computed(() => [
  t('chatbot.suggestedPrompts.prompt1.action'),
  t('chatbot.suggestedPrompts.prompt2.action'),
  t('home.guidedQuestion3'),
])

const startChatLink = (prompt?: string) =>
  localePath({
    path: '/chat',
    query: prompt ? { prompt } : {},
  })
</script>

<template>
  <motion.div
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    class="flex flex-col items-center"
  >
    <TclSeo
      :description="t('layout.description')"
      image="/tcl-fallback-169.jpg"
      image-type="image/jpeg"
      :title="t('layout.home')"
    />

    <TclLoader v-if="loading" />

    <template v-else>
      <section class="container py-8 md:py-12 lg:py-16">
        <div
          class="grid gap-6 lg:gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]"
        >
          <div class="space-y-6">
            <div
              class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary"
            >
              <span>{{ t('home.heroEyebrow') }}</span>
            </div>

            <div class="space-y-4">
              <h1
                class="max-w-[12ch] font-pt text-[clamp(2.8rem,6vw,5.3rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-foreground"
              >
                {{ t('home.heroTitle') }}
              </h1>
              <p
                class="max-w-[62ch] text-base leading-7 text-muted-foreground md:text-lg md:leading-8"
              >
                {{ t('home.heroDescription') }}
              </p>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <TclMoreButton
                extra="w-full sm:w-auto rounded-full px-6"
                :label="t('home.heroPrimaryCta')"
                link="/news?offset=0&limit=5"
              />

              <a v-if="!loggedIn" class="inline-flex" href="/auth/auth0">
                <Button
                  variant="outline"
                  class="w-full rounded-full border-primary/25 px-6 text-primary hover:bg-primary/10 hover:text-primary sm:w-auto"
                >
                  {{ t('home.heroSecondaryCtaSignedOut') }}
                </Button>
              </a>

              <NuxtLink v-else :to="startChatLink()">
                <Button
                  variant="outline"
                  class="w-full rounded-full border-primary/25 px-6 text-primary hover:bg-primary/10 hover:text-primary sm:w-auto"
                >
                  {{ t('home.heroSecondaryCta') }}
                </Button>
              </NuxtLink>
            </div>

            <div class="grid gap-3 md:grid-cols-3">
              <div
                class="rounded-3xl border border-border/70 bg-background p-4 shadow-sm"
              >
                <p
                  class="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-primary"
                >
                  {{ t('home.signalLabel') }}
                </p>
                <p class="mt-2 text-sm leading-6 text-foreground">
                  {{ t('home.signalCopy') }}
                </p>
              </div>
              <div
                class="rounded-3xl border border-border/70 bg-background p-4 shadow-sm"
              >
                <p
                  class="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-primary"
                >
                  {{ t('home.researchLabel') }}
                </p>
                <p class="mt-2 text-sm leading-6 text-foreground">
                  {{ t('home.researchCopy') }}
                </p>
              </div>
              <div
                class="rounded-3xl border border-border/70 bg-background p-4 shadow-sm"
              >
                <p
                  class="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-primary"
                >
                  {{ t('home.guidanceLabel') }}
                </p>
                <p class="mt-2 text-sm leading-6 text-foreground">
                  {{ t('home.guidanceCopy') }}
                </p>
              </div>
            </div>
          </div>

          <div class="grid gap-4">
            <div
              class="rounded-[2rem] border border-primary/15 bg-[hsl(var(--primary-foreground))] p-6 shadow-sm"
            >
              <p
                class="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary"
              >
                {{ t('home.guidedQuestionsEyebrow') }}
              </p>
              <h2
                class="mt-3 max-w-[16ch] font-pt text-3xl font-semibold leading-tight tracking-[-0.03em] text-foreground"
              >
                {{ t('home.guidedQuestionsTitle') }}
              </h2>
              <p
                class="mt-3 max-w-[38ch] text-sm leading-6 text-muted-foreground"
              >
                {{
                  loggedIn
                    ? t('home.guidedQuestionsDescription')
                    : t('home.guidedQuestionsDescriptionSignedOut')
                }}
              </p>

              <div class="mt-5 grid gap-2.5">
                <template v-for="question in guidedQuestions" :key="question">
                  <NuxtLink v-if="loggedIn" :to="startChatLink(question)">
                    <Button
                      variant="outline"
                      class="h-auto w-full items-start justify-start rounded-2xl border-border/70 px-4 py-3 text-left whitespace-normal hover:border-primary/30 hover:bg-primary/5"
                    >
                      {{ question }}
                    </Button>
                  </NuxtLink>
                  <a v-else href="/auth/auth0">
                    <Button
                      variant="outline"
                      class="h-auto w-full items-start justify-start rounded-2xl border-border/70 px-4 py-3 text-left whitespace-normal hover:border-primary/30 hover:bg-primary/5"
                    >
                      {{ question }}
                    </Button>
                  </a>
                </template>
              </div>
            </div>

            <div class="rounded-[2rem] border border-border/70 bg-muted/30 p-6">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p
                    class="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary"
                  >
                    {{ t('home.signalEyebrow') }}
                  </p>
                  <h2
                    class="mt-2 font-title text-2xl font-semibold leading-tight tracking-[-0.02em] text-foreground"
                  >
                    {{ t('home.signalTitle') }}
                  </h2>
                </div>
                <NuxtLink :to="localePath('/news?offset=0&limit=5')">
                  <Button variant="ghost" size="sm" class="text-primary">
                    {{ t('home.signalCta') }}
                  </Button>
                </NuxtLink>
              </div>

              <div class="mt-4 space-y-3">
                <a
                  v-for="story in primaryStories"
                  :key="story.id"
                  :href="`${story.link}`"
                  class="block rounded-2xl border border-border/60 bg-background px-4 py-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
                  target="_blank"
                >
                  <p
                    class="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-primary"
                  >
                    {{ story.source || t('home.latestNews') }}
                  </p>
                  <h3
                    class="mt-2 font-title text-lg font-semibold leading-6 tracking-[-0.02em] text-foreground"
                  >
                    {{ story.title }}
                  </h3>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="container pb-8 md:pb-12">
        <div class="mb-6 max-w-[48rem] md:mb-8">
          <p
            class="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary"
          >
            {{ t('home.nowEyebrow') }}
          </p>
          <h2
            class="mt-3 max-w-[12ch] font-pt text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-foreground"
          >
            {{ t('home.nowTitle') }}
          </h2>
          <p class="mt-3 max-w-[62ch] text-sm leading-6 text-muted-foreground">
            {{ t('home.nowDescription') }}
          </p>
        </div>

        <TclShowcase :docs="showcase" />
      </section>

      <motion.div
        v-if="promo.length > 0"
        class="w-full"
        :initial="{ opacity: 0 }"
        :whileInView="{ opacity: 1 }"
      >
        <template v-for="zone in promo" :key="<string>zone.zoneId">
          <div class="container mb-8">
            <a
              :href="<string>zone.url"
              :target="zone.external ? '_blank' : '_self'"
            >
              <SanityImage
                :alt="zone.name"
                :asset-id="<string>zone.visual"
                class="w-full rounded-[2rem] object-cover"
              />
            </a>
          </div>
        </template>
      </motion.div>

      <section class="container py-8 md:py-12">
        <div class="grid gap-10 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div>
            <div class="mb-6 max-w-[40rem]">
              <p
                class="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary"
              >
                {{ t('home.reportingEyebrow') }}
              </p>
              <h2
                class="mt-3 font-pt text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-foreground"
              >
                {{ t('home.reportingTitle') }}
              </h2>
              <p class="mt-3 text-sm leading-6 text-muted-foreground">
                {{ t('home.reportingDescription') }}
              </p>
            </div>

            <div class="grid gap-6 md:grid-cols-2">
              <TclPostCard
                v-for="article in reportingStories"
                :key="article.id"
                class="h-full border-border/70 shadow-none"
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

            <div class="pt-6">
              <TclMoreButton
                extra="w-full md:w-auto rounded-full px-6"
                :label="t('home.seeAllNews')"
                link="/news?offset=0&limit=5"
              />
            </div>
          </div>

          <div class="rounded-[2rem] border border-border/70 bg-muted/30 p-6">
            <div class="max-w-[32rem]">
              <p
                class="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary"
              >
                {{ t('home.watchEyebrow') }}
              </p>
              <h2
                class="mt-3 font-pt text-3xl font-semibold leading-tight tracking-[-0.03em] text-foreground"
              >
                {{ t('home.watchTitle') }}
              </h2>
              <p class="mt-3 text-sm leading-6 text-muted-foreground">
                {{ t('home.watchDescription') }}
              </p>
            </div>

            <div class="mt-6 grid gap-5">
              <TclMedia
                v-for="article in watchStories"
                :key="article.id"
                class="min-w-0 rounded-2xl border border-border/60 bg-background px-4 py-4"
                :date="article.date"
                :description="article.description || undefined"
                :limited="article.limited"
                :link="<string>article.link"
                :metadata="article.metadata"
                :premium="article.premium"
                :source="article.source || undefined"
                :tags="<Tag[]>article.tags"
                target="_blank"
                :title="<string>article.title"
                :visual="article.visual"
              />
            </div>

            <div class="pt-6">
              <TclMoreButton
                extra="w-full md:w-auto rounded-full px-6"
                :label="t('home.seeAllPhw')"
                link="/public-health?offset=0&limit=5"
              />
            </div>
          </div>
        </div>
      </section>

      <section class="container py-8 md:py-12">
        <div class="mb-6 max-w-[42rem]">
          <p
            class="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary"
          >
            {{ t('home.researchEyebrow') }}
          </p>
          <h2
            class="mt-3 font-pt text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-foreground"
          >
            {{ t('home.researchTitle') }}
          </h2>
          <p class="mt-3 text-sm leading-6 text-muted-foreground">
            {{ t('home.researchDescription') }}
          </p>
        </div>

        <TclArticleBlock :articles="library" class="py-2 md:py-4" />

        <div class="pt-6">
          <TclMoreButton
            extra="w-full md:w-auto rounded-full px-6"
            :label="t('home.seeAllLibrary')"
            link="/scientific-library?offset=0&limit=5"
          />
        </div>
      </section>

      <section class="w-full bg-muted/35 py-8 md:py-12">
        <div class="container">
          <div
            class="grid gap-10 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
          >
            <div>
              <div class="mb-6 max-w-[40rem]">
                <p
                  class="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary"
                >
                  {{ t('home.watchAndAttendEyebrow') }}
                </p>
                <h2
                  class="mt-3 font-pt text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-foreground"
                >
                  {{ t('home.watchAndAttendTitle') }}
                </h2>
                <p class="mt-3 text-sm leading-6 text-muted-foreground">
                  {{ t('home.watchAndAttendDescription') }}
                </p>
              </div>

              <div class="flex flex-col gap-6">
                <TclVideoCarousel
                  class="hidden md:block"
                  link="/video?offset=0&limit=5"
                  :see-all-label="t('home.seeAllVideos')"
                  :videos="videos"
                />

                <div class="grid gap-6 md:hidden">
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

                <div class="md:hidden">
                  <TclMoreButton
                    extra="w-full rounded-full px-6"
                    :label="t('home.seeAllVideos')"
                    link="/video?offset=0&limit=5"
                  />
                </div>
              </div>
            </div>

            <div
              v-if="upcomingEvents.length"
              class="rounded-[2rem] border border-border/70 bg-background p-6"
            >
              <p
                class="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary"
              >
                {{ t('home.eventsEyebrow') }}
              </p>
              <h2
                class="mt-3 font-pt text-3xl font-semibold leading-tight tracking-[-0.03em] text-foreground"
              >
                {{ t('home.events') }}
              </h2>
              <p class="mt-3 text-sm leading-6 text-muted-foreground">
                {{ t('home.eventsDescription') }}
              </p>

              <div class="mt-6 grid gap-6">
                <TclPostCard
                  v-for="event in upcomingEvents"
                  :key="event.id"
                  class="border-border/70 shadow-none"
                  :date="event.date"
                  :description="event.description"
                  :end="event.end"
                  :free="event.free"
                  :link="<string>event.link"
                  :metadata="event.metadata"
                  :tags="<Tag[]>event.tags"
                  target="_self"
                  :title="<string>event.title"
                  :visual="event.visual"
                />
              </div>

              <div class="pt-6">
                <TclMoreButton
                  extra="w-full rounded-full px-6"
                  :label="t('home.seeAllEvents')"
                  link="/event?offset=0&limit=5"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </motion.div>
</template>
