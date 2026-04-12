import QUICK_SEARCH_QUERY from '@/sanity/queries/quickSearch.sanity'
import type { QUICK_SEARCH_QUERYResult } from '@/sanity/types'

const SEARCH_CATEGORIES = [
  'news',
  'scientific-library',
  'public-health',
  'video',
] as const

type SearchCategory = (typeof SEARCH_CATEGORIES)[number]
type SearchResult = QUICK_SEARCH_QUERYResult[number]

export type SearchHighlightPart = {
  isMatch: boolean
  text: string
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const useQuickSearch = () => {
  const { t, locale } = useI18n()
  const localePath = useLocalePath()
  const router = useRouter()

  const isOpen = ref(false)
  const isSearching = ref(false)
  const searchError = ref(false)
  const searchQuery = ref('')
  const searchResults = ref<QUICK_SEARCH_QUERYResult>([])

  const hasQuery = computed(() => searchQuery.value.trim().length > 0)
  const shouldShowResults = computed(() => isOpen.value && hasQuery.value)
  const totalResults = computed(() => searchResults.value.length)

  const groupedResults = computed(() =>
    SEARCH_CATEGORIES.map((category) => ({
      category,
      label: t(`layout.${category}`),
      results: searchResults.value.filter((item) => item.type === category),
    })).filter(({ results }) => results.length > 0),
  )

  const runSearch = useDebounceFn(async () => {
    const query = searchQuery.value.trim()

    if (!query) {
      searchResults.value = []
      isSearching.value = false
      searchError.value = false
      return
    }

    isSearching.value = true
    searchError.value = false

    try {
      const { data } = await useSanityQuery<QUICK_SEARCH_QUERYResult>(
        QUICK_SEARCH_QUERY,
        { searchTerm: query, locale },
      )

      searchResults.value = data?.value || []
    } catch (error) {
      console.error('Quick search failed:', error)
      searchResults.value = []
      searchError.value = true
    } finally {
      isSearching.value = false
    }
  }, 250)

  watch(searchQuery, (value) => {
    if (!value.trim()) {
      searchResults.value = []
      isSearching.value = false
      searchError.value = false
      return
    }

    isOpen.value = true
    runSearch()
  })

  const clearSearch = () => {
    searchQuery.value = ''
    searchResults.value = []
    searchError.value = false
    isSearching.value = false
  }

  const closeResults = () => {
    isOpen.value = false
  }

  const openResults = () => {
    isOpen.value = true
  }

  const resetSearch = () => {
    clearSearch()
    closeResults()
  }

  const retrySearch = () => {
    if (!hasQuery.value) return

    runSearch()
  }

  const viewAllResults = () => {
    closeResults()

    router.push({
      path: localePath('/search'),
      query: { limit: 5, offset: 0, q: searchQuery.value.trim() },
    })
  }

  const getHighlightParts = (text: string | null | undefined) => {
    if (!text) return []

    const query = searchQuery.value.trim()
    if (!query) {
      return [{ isMatch: false, text }]
    }

    const matcher = new RegExp(`(${escapeRegExp(query)})`, 'gi')

    return text
      .split(matcher)
      .filter(Boolean)
      .map((part) => ({
        isMatch: part.toLowerCase() === query.toLowerCase(),
        text: part,
      })) satisfies SearchHighlightPart[]
  }

  const getResultTo = (result: SearchResult) =>
    result.link ? localePath(result.link) : undefined

  const getResultHref = (result: SearchResult) => result.url || undefined

  const isExternalResult = (result: SearchResult) => Boolean(result.url)

  const getCategoryAccentClass = (category: SearchCategory) => {
    switch (category) {
      case 'news':
        return 'text-primary'
      case 'scientific-library':
        return 'text-primary/85'
      case 'public-health':
        return 'text-primary/70'
      case 'video':
        return 'text-primary/60'
    }
  }

  return {
    clearSearch,
    closeResults,
    getCategoryAccentClass,
    getHighlightParts,
    getResultHref,
    getResultTo,
    groupedResults,
    hasQuery,
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
  }
}
