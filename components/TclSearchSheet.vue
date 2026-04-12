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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'

const { t } = useI18n()

const drawerOpen = ref(false)

const {
  clearSearch,
  getCategoryAccentClass,
  getHighlightParts,
  getResultHref,
  getResultTo,
  groupedResults,
  isExternalResult,
  isSearching,
  openResults,
  resetSearch,
  retrySearch,
  searchError,
  searchQuery,
  shouldShowResults,
  totalResults,
  viewAllResults,
} = useQuickSearch()

watch(drawerOpen, (isOpen) => {
  if (!isOpen) {
    resetSearch()
  } else {
    openResults()
  }
})

const closeDrawer = () => {
  drawerOpen.value = false
}

const onViewAll = () => {
  viewAllResults()
  closeDrawer()
}
</script>

<template>
  <Drawer v-model:open="drawerOpen">
    <DrawerTrigger as-child>
      <Button size="icon" variant="outline" class="rounded-full md:hidden">
        <SearchIcon />
        <span class="sr-only">{{ t('layout.search') }}</span>
      </Button>
    </DrawerTrigger>

    <DrawerContent>
      <DrawerHeader class="mb-2 border-b">
        <div class="relative">
          <Input
            v-model="searchQuery"
            :placeholder="t('searchbox.placeholder')"
            class="h-11 rounded-full border-border/70 bg-background/90 pl-10 pr-11 text-base"
            @focus="openResults"
            @keydown.esc.stop.prevent="closeDrawer"
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
      </DrawerHeader>

      <div class="h-[60vh] overflow-y-auto">
        <template v-if="shouldShowResults">
          <div
            class="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur-sm"
          >
            <span class="text-sm font-medium text-muted-foreground">
              {{
                isSearching
                  ? t('searchbox.results.loading')
                  : t('searchbox.results.total', { amount: totalResults })
              }}
            </span>
          </div>

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
                  @click="closeDrawer"
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
                  @click="closeDrawer"
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
        </template>
      </div>

      <DrawerFooter class="bg-background">
        <DrawerClose as-child>
          <Button
            class="w-full"
            :disabled="!searchQuery.trim().length"
            @click="onViewAll"
          >
            {{ t('searchbox.viewAll') }}
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
