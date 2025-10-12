<script setup lang="ts">
import QUICK_SEARCH_QUERY from '@/sanity/queries/quickSearch.sanity'
import type { QUICK_SEARCH_QUERYResult } from '@/sanity/types'

import {
  Search as SearchIcon,
  X as XIcon,
  FileText as FileTextIcon,
  BookOpen as BookOpenIcon,
  AlertCircle as AlertCircleIcon,
  Video as VideoIcon,
  Calendar as CalendarIcon,
  SearchX as SearchXIcon,
} from 'lucide-vue-next'

// Import shadcn-vue components
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
const { locale, t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()

const searchQuery = ref('')
const showResults = ref(false)
const categories = ['news', 'scientific-library', 'public-health', 'video']
const inputWidth = ref(0)

// Format category name for display
const formatCategory = (category: string) => {
  // TODO: Get translation for category names
  return t(`layout.${category}`)
}

const searchResults = ref<QUICK_SEARCH_QUERYResult>([])

// Get total number of results
const totalResults = computed(() => searchResults.value.length)

// Get results by category
const getResultsByCategory = (category: string) => {
  return searchResults.value.filter((item) => item.type === category)
}

// Highlight matching text
const highlightMatch = (text: string) => {
  if (!searchQuery.value) return text

  const regex = new RegExp(`(${searchQuery.value})`, 'gi')
  return text.replace(regex, '<span class="bg-primary font-medium">$1</span>')
}

// Clear search
const clearSearch = () => {
  searchQuery.value = ''
}

// Select a result
const selectResult = (result: QUICK_SEARCH_QUERYResult[0]) => {
  showResults.value = false
  // searchQuery.value = ''

  if (result.link) {
    router.push(localePath(result.link))
  } else if (result.url) {
    window.open(result.url, '_blank')
  } else {
    // Handle case where no link is provided
    console.warn('No link or URL provided for result:', result)
  }
}

// View all results
const viewAllResults = () => {
  router.push({
    path: localePath('/search'),
    query: { limit: 5, offset: 0, q: searchQuery.value },
  })
}

// Handle click outside to close results
const handleClickOutside = () => {
  if (showResults.value) {
    showResults.value = false
  }
}

const handleInputFocus = (e: InputEvent) => {
  e.stopPropagation()
  showResults.value = searchQuery.value?.length > 0
}

const searchFn = async () => {
  if (!searchQuery.value) {
    searchResults.value = []
    return
  }

  const { data } = await useSanityQuery<QUICK_SEARCH_QUERYResult>(
    QUICK_SEARCH_QUERY,
    { searchTerm: searchQuery.value, locale }, // Adjust locale as needed
  )

  searchResults.value = data?.value || []
}

// Show results when typing
watch(searchQuery, (newValue) => {
  showResults.value = newValue.length > 0
  useDebounceFn(searchFn, 300, { rejectOnCancel: true })()
})

onMounted(() => {
  useEventListener(document, 'click', handleClickOutside)
})
</script>

<template>
  <div class="relative w-full max-w-md search-container">
    <!-- Search Input -->
    <div class="relative">
      <Input
        v-model="searchQuery"
        :placeholder="t('searchbox.placeholder')"
        class="w-full h-10 pl-10"
        @click="handleInputFocus"
      />
      <SearchIcon
        class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
      />
      <Button
        v-if="searchQuery"
        variant="ghost"
        size="icon"
        class="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
        @click="clearSearch"
      >
        <XIcon class="h-4 w-4" />
      </Button>
    </div>

    <!-- Results Dropdown - Fixed width, positioned absolutely -->
    <div
      v-if="searchQuery && showResults"
      class="absolute z-50 left-0 mt-1 w-[380px] max-w-[95vw] bg-background rounded-md border shadow-md overflow-hidden"
      :style="{ minWidth: inputWidth + 'px' }"
    >
      <div class="p-2 flex items-center justify-between border-b">
        <span class="text-sm font-medium text-muted-foreground">
          {{ t('searchbox.results.total', { amount: totalResults }) }}
        </span>
      </div>

      <!-- No results state -->
      <div v-if="searchResults.length === 0" class="p-4 text-center">
        <SearchXIcon class="w-6 h-6 text-muted-foreground mx-auto mb-2" />
        <p class="text-sm text-muted-foreground">
          {{ t('searchbox.results.noResults', { query: searchQuery }) }}
        </p>
      </div>

      <!-- Results by category -->
      <div v-else>
        <div v-for="(category, index) in categories" :key="index" class="py-2">
          <div v-if="getResultsByCategory(category).length > 0">
            <div
              class="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase"
            >
              {{ formatCategory(category) }}
            </div>

            <div
              v-for="(result, resultIndex) in getResultsByCategory(category)"
              :key="resultIndex"
              class="px-4 py-2 hover:bg-accent cursor-pointer"
              @click="selectResult(result)"
            >
              <div class="flex items-start">
                <!-- Category-specific icon -->
                <div class="mr-3 mt-0.5">
                  <FileTextIcon
                    v-if="category === 'news'"
                    class="w-4 h-4 text-primary"
                  />
                  <BookOpenIcon
                    v-else-if="category === 'scientific-library'"
                    class="w-4 h-4 text-emerald-500"
                  />
                  <AlertCircleIcon
                    v-else-if="category === 'public-health'"
                    class="w-4 h-4 text-amber-500"
                  />
                  <VideoIcon
                    v-else-if="category === 'video'"
                    class="w-4 h-4 text-rose-500"
                  />
                </div>

                <!-- Result content -->
                <div class="flex-1">
                  <div
                    class="text-sm font-medium"
                    v-html="highlightMatch(result.title as string)"
                  ></div>
                  <div
                    class="text-xs text-muted-foreground mt-1"
                    v-html="highlightMatch(result.description ?? '')"
                  ></div>
                  <div class="flex items-center mt-1">
                    <CalendarIcon class="w-3 h-3 text-muted-foreground mr-1" />
                    <span class="text-xs text-muted-foreground">{{
                      result.date
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- View all results -->
        <div class="p-2 border-t">
          <Button
            variant="ghost"
            @click="viewAllResults"
            class="w-full justify-center text-primary hover:text-primary hover:bg-primary/10"
          >
            {{ t('searchbox.viewAll') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
