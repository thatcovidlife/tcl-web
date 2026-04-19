<script setup lang="ts">
import { motion } from 'motion-v'
import type { Tag } from '@/lib/types'
import LATEST_PUBLICATIONS_QUERY from '@/sanity/queries/latestPublications.sanity'
import type { LATEST_PUBLICATIONS_QUERYResult } from '@/sanity/types'
import PROMO_QUERY from '@/sanity/queries/promo.sanity'
import type { PROMO_QUERYResult } from '@/sanity/types'
import * as Sentry from '@sentry/nuxt'

// const host = computed(() => window?.location?.origin || '')
const { locale, t } = useI18n()
const localePath = useLocalePath()
const { loggedIn } = useUserSession()

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
// const error = computed(() => status?.value === 'error')

const events = computed(() => data?.value?.events || [])
const library = computed(() => data?.value?.library || [])
const news = computed(() => data?.value?.news || [])
const phw = computed(() => data?.value?.phw || [])
const showcase = computed(() => data?.value?.showcase || [])
const videos = computed(() => data?.value?.videos || [])
const promo = computed(() => promoData?.value || [])

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
      <!-- CHATBOT TEASER -->
      <motion.div
        class="w-full"
        :initial="{ opacity: 0 }"
        :whileInView="{ opacity: 1 }"
      >
        <section class="container py-8 md:py-12 lg:py-16">
          <div
            class="grid gap-6 lg:gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]"
          >
            <div class="space-y-6">
              <Badge
                variant="outline"
                class="gap-2 rounded-full border-primary/20 bg-primary/5 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary"
              >
                {{ t('home.heroEyebrow') }}
              </Badge>

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
                  extra="w-full sm:w-auto px-6"
                  :label="t('home.heroPrimaryCta')"
                  link="/news?offset=0&limit=5"
                />

                <a v-if="!loggedIn" class="inline-flex" href="/auth/auth0">
                  <Button
                    variant="outline"
                    class="w-full border-primary/25 px-6 text-primary hover:bg-primary/10 hover:text-primary sm:w-auto"
                  >
                    {{ t('home.heroSecondaryCtaSignedOut') }}
                  </Button>
                </a>

                <NuxtLink v-else :to="startChatLink()">
                  <Button
                    variant="outline"
                    class="w-full border-primary/25 px-6 text-primary hover:bg-primary/10 hover:text-primary sm:w-auto"
                  >
                    {{ t('home.heroSecondaryCta') }}
                  </Button>
                </NuxtLink>
              </div>
            </div>

            <Card
              class="gap-0 border-primary/15 bg-[hsl(var(--primary-foreground))] p-6 shadow-sm dark:bg-muted/40"
            >
              <CardHeader class="p-0">
                <Label
                  class="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary"
                >
                  {{ t('home.guidedQuestionsEyebrow') }}
                </Label>
                <CardTitle
                  class="mt-3 max-w-[16ch] font-pt text-3xl font-semibold leading-tight tracking-[-0.03em]"
                >
                  {{ t('home.guidedQuestionsTitle') }}
                </CardTitle>
              </CardHeader>
              <CardContent class="mt-3 p-0">
                <p class="max-w-[38ch] text-sm leading-6 text-muted-foreground">
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
                        class="h-auto w-full items-start justify-start border-border/70 px-4 py-3 text-left whitespace-normal hover:border-primary/30 hover:bg-primary/5"
                      >
                        {{ question }}
                      </Button>
                    </NuxtLink>
                    <a v-else href="/auth/auth0">
                      <Button
                        variant="outline"
                        class="h-auto w-full items-start justify-start border-border/70 px-4 py-3 text-left whitespace-normal hover:border-primary/30 hover:bg-primary/5"
                      >
                        {{ question }}
                      </Button>
                    </a>
                  </template>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </motion.div>

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

      <!-- PROMO -->
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
                class="w-full object-cover"
              />
            </a>
          </div>
        </template>
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
