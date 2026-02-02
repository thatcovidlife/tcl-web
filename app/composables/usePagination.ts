import type { LocationQuery, LocationQueryValue } from 'vue-router'

export const usePagination = () => {
  const route = useRoute()
  const router = useRouter()

  const DEFAULT_LIMIT = 5
  const DEFAULT_OFFSET = 0
  const limit = computed(
    () => parseInt(route.query?.limit as string) || DEFAULT_LIMIT,
  )
  const offset = computed(
    () => parseInt(route.query?.offset as string) || DEFAULT_OFFSET,
  )

  const currentPage = computed(() => Math.ceil(offset.value / limit.value) + 1)

  const updateQueryParams = (payload: LocationQuery) => {
    router.push({
      query: {
        ...route.query,
        ...payload,
      },
    })
  }

  const go = (l: number, o: number) => {
    updateQueryParams({
      limit: l.toString() as LocationQueryValue,
      offset: o.toString() as LocationQueryValue,
    })
  }

  const onPreviousPage = (e: Event) => {
    e.preventDefault()

    if (offset.value === 0) {
      return
    }

    const previousOffset = offset.value - limit.value
    go(limit.value, previousOffset)
  }

  const onNextPage = (e: Event, total: number) => {
    e.preventDefault()

    const nextOffset = offset.value + limit.value

    if (nextOffset >= total) {
      return
    }

    go(limit.value, nextOffset)
  }

  const onPageChange = (page: number) => {
    const newOffset = (page - 1) * limit.value
    go(limit.value, newOffset)
  }

  const resetPagination = () => {
    go(DEFAULT_LIMIT, DEFAULT_OFFSET)
  }

  return {
    currentPage,
    limit,
    offset,
    onNextPage,
    onPageChange,
    onPreviousPage,
    resetPagination,
    route,
    updateQueryParams,
  }
}
