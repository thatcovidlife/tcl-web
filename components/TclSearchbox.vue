<script setup lang="ts">
import {
  AlertCircle as AlertCircleIcon,
  BookOpen as BookOpenIcon,
  Calendar as CalendarIcon,
  FileText as FileTextIcon,
  Search as SearchIcon,
  SearchX as SearchXIcon,
  Video as VideoIcon,
  X as XIcon,
} from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const { t } = useI18n()

const {
  clearSearch,
  closeResults,
  getCategoryAccentClass,
  getHighlightParts,
  getResultHref,
  getResultTo,
  groupedResults,
  isExternalResult,
  isSearching,
  openResults,
  retrySearch,
  searchError,
  searchQuery,
  shouldShowResults,
  totalResults,
  viewAllResults,
} = useQuickSearch()

const searchRoot = useTemplateRef<HTMLElement>('searchRoot')

useEventListener(document, 'pointerdown', (event) => {
  if (!searchRoot.value?.contains(event.target as Node)) {
    closeResults()
  }
})
</script>

<template>
  <div ref="searchRoot" class="relative w-full max-w-md" role="search">
    <div class="relative">
      <Input
        v-model="searchQuery"
        :placeholder="t('searchbox.placeholder')"
        aria-controls="desktop-search-results"
        :aria-expanded="shouldShowResults"
        class="h-11 rounded-full border-border/70 bg-background/90 pl-10 pr-11"
        @focus="openResults"
        @keydown.esc.stop.prevent="closeResults"
      />
      <SearchIcon
        class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <Button
        v-if="searchQuery"
        variant="ghost"
        size="icon"
        class="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
        @click="clearSearch"
      >
        <XIcon class="h-4 w-4" />
        <span class="sr-only">{{ t('searchbox.clear') }}</span>
      </Button>
    </div>

    <div
      v-if="shouldShowResults"
      id="desktop-search-results"
      class="absolute left-0 z-50 mt-2 w-full min-w-[22rem] overflow-hidden rounded-3xl border border-border/70 bg-background shadow-2xl shadow-black/10"
    >
      <div
        class="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3"
      >
        <span class="text-sm font-medium text-muted-foreground">
          {{
            isSearching
              ? t('searchbox.results.loading')
              : t('searchbox.results.total', { amount: totalResults })
          }}
        </span>
        <Button
          variant="ghost"
          size="sm"
          class="h-auto px-2 py-1 text-xs text-primary"
          :disabled="!searchQuery.trim().length"
          @click="viewAllResults"
        >
          {{ t('searchbox.viewAll') }}
        </Button>
      </div>

      <div class="max-h-[28rem] overflow-y-auto">
        <div v-if="searchError" class="space-y-3 px-4 py-5">
          <p class="text-sm text-foreground">
            {{ t('searchbox.results.error') }}
          </p>
          <Button variant="outline" size="sm" @click="retrySearch">
            {{ t('searchbox.results.retry') }}
          </Button>
        </div>

        <div
          v-else-if="!isSearching && groupedResults.length === 0"
          class="space-y-2 px-4 py-6 text-center"
        >
          <SearchXIcon class="mx-auto h-6 w-6 text-muted-foreground" />
          <p class="text-sm font-medium text-foreground">
            {{ t('searchbox.results.noResults', { query: searchQuery }) }}
          </p>
          <p class="text-xs leading-5 text-muted-foreground">
            {{ t('searchbox.results.hint') }}
          </p>
        </div>

        <div v-else class="py-2">
          <section
            v-for="group in groupedResults"
            :key="group.category"
            class="py-1"
          >
            <div
              class="px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
            >
              {{ group.label }}
            </div>

            <template v-for="result in group.results" :key="result.id">
              <NuxtLink
                v-if="!isExternalResult(result) && getResultTo(result)"
                :to="getResultTo(result)"
                class="block border-y border-transparent px-4 py-3 transition-colors hover:border-border/60 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                @click="closeResults"
              >
                <div class="flex items-start gap-3">
                  <div
                    :class="getCategoryAccentClass(group.category)"
                    class="mt-0.5 shrink-0"
                  >
                    <FileTextIcon
                      v-if="group.category === 'news'"
                      class="h-4 w-4"
                    />
                    <BookOpenIcon
                      v-else-if="group.category === 'scientific-library'"
                      class="h-4 w-4"
                    />
                    <AlertCircleIcon
                      v-else-if="group.category === 'public-health'"
                      class="h-4 w-4"
                    />
                    <VideoIcon v-else class="h-4 w-4" />
                  </div>

                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium leading-5 text-foreground">
                      <template
                        v-for="(part, index) in getHighlightParts(
                          result.title as string,
                        )"
                        :key="`${result.id}-title-${index}`"
                      >
                        <mark
                          v-if="part.isMatch"
                          class="rounded-sm bg-primary/15 px-0.5 text-primary"
                        >
                          {{ part.text }}
                        </mark>
                        <span v-else>{{ part.text }}</span>
                      </template>
                    </p>

                    <p
                      v-if="result.description"
                      class="mt-1 text-xs leading-5 text-muted-foreground"
                    >
                      <template
                        v-for="(part, index) in getHighlightParts(
                          result.description,
                        )"
                        :key="`${result.id}-description-${index}`"
                      >
                        <mark
                          v-if="part.isMatch"
                          class="rounded-sm bg-primary/15 px-0.5 text-primary"
                        >
                          {{ part.text }}
                        </mark>
                        <span v-else>{{ part.text }}</span>
                      </template>
                    </p>

                    <div
                      v-if="result.date"
                      class="mt-2 flex items-center gap-1 text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground"
                    >
                      <CalendarIcon class="h-3 w-3" />
                      <span>{{ result.date }}</span>
                    </div>
                  </div>
                </div>
              </NuxtLink>

              <a
                v-else-if="getResultHref(result)"
                :href="getResultHref(result)"
                class="block border-y border-transparent px-4 py-3 transition-colors hover:border-border/60 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rel="noopener noreferrer"
                target="_blank"
                @click="closeResults"
              >
                <div class="flex items-start gap-3">
                  <div
                    :class="getCategoryAccentClass(group.category)"
                    class="mt-0.5 shrink-0"
                  >
                    <FileTextIcon
                      v-if="group.category === 'news'"
                      class="h-4 w-4"
                    />
                    <BookOpenIcon
                      v-else-if="group.category === 'scientific-library'"
                      class="h-4 w-4"
                    />
                    <AlertCircleIcon
                      v-else-if="group.category === 'public-health'"
                      class="h-4 w-4"
                    />
                    <VideoIcon v-else class="h-4 w-4" />
                  </div>

                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium leading-5 text-foreground">
                      <template
                        v-for="(part, index) in getHighlightParts(
                          result.title as string,
                        )"
                        :key="`${result.id}-external-title-${index}`"
                      >
                        <mark
                          v-if="part.isMatch"
                          class="rounded-sm bg-primary/15 px-0.5 text-primary"
                        >
                          {{ part.text }}
                        </mark>
                        <span v-else>{{ part.text }}</span>
                      </template>
                    </p>

                    <p
                      v-if="result.description"
                      class="mt-1 text-xs leading-5 text-muted-foreground"
                    >
                      <template
                        v-for="(part, index) in getHighlightParts(
                          result.description,
                        )"
                        :key="`${result.id}-external-description-${index}`"
                      >
                        <mark
                          v-if="part.isMatch"
                          class="rounded-sm bg-primary/15 px-0.5 text-primary"
                        >
                          {{ part.text }}
                        </mark>
                        <span v-else>{{ part.text }}</span>
                      </template>
                    </p>

                    <div
                      v-if="result.date"
                      class="mt-2 flex items-center gap-1 text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground"
                    >
                      <CalendarIcon class="h-3 w-3" />
                      <span>{{ result.date }}</span>
                    </div>
                  </div>
                </div>
              </a>
            </template>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
