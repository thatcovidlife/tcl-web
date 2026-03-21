<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { ArrowRight, CornerDownLeft, MessageSquare } from 'lucide-vue-next'
import { cn, decodeHtmlEntities } from '@/lib/utils'
import { useApiRoutes } from '@/composables/useApiRoutes'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import Kbd from '@/components/ui/kbd/Kbd.vue'
import Spinner from '@/components/ui/spinner/Spinner.vue'

interface Chat {
  id: string
  title: string
  createdAt: string | Date
  preview?: string
  searchKeywords?: string
}

interface SearchResultChat {
  chatId: string
  title: string
  createdAt: string | Date
  preview: string
}

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const { getUserChats, searchChats } = useApiRoutes()
const { user } = useUserSession()
const { t } = useI18n()
const localePath = useLocalePath()

const search = ref('')
const isSearching = ref(false)
const isLoadingDefault = ref(false)
const defaultChats = ref<Chat[]>([])
const searchResults = ref<SearchResultChat[]>([])
const debounceTimer = ref<number | null>(null)

const transformedSearchResults = computed(() => {
  return searchResults.value?.map((result) => ({
    id: result.chatId,
    title: result.title,
    createdAt: result.createdAt,
    preview: result.preview,
    searchKeywords: [result.title, result.preview].filter(Boolean).join(' '),
  }))
})

const displayedChats = computed(() => {
  return search.value.trim()
    ? [...transformedSearchResults.value]
    : defaultChats.value
})

const clearPendingSearch = () => {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
    debounceTimer.value = null
  }
}

const resetSearchState = () => {
  search.value = ''
  searchResults.value = []
  isSearching.value = false
  clearPendingSearch()
}

const loadDefaultChats = async () => {
  if (!user.value) return

  isLoadingDefault.value = true
  try {
    const result = await getUserChats(3, 0)
    if (result?.data) {
      defaultChats.value = result.data
      return
    }

    defaultChats.value = []
  } catch (error) {
    console.error('Failed to load default chats:', error)
    defaultChats.value = []
  } finally {
    isLoadingDefault.value = false
  }
}

const performSearch = async (searchTerm: string) => {
  if (!user.value) return

  if (!searchTerm.trim()) {
    searchResults.value = []
    isSearching.value = false
    return
  }

  isSearching.value = true
  try {
    const result = await searchChats(searchTerm, 1, 10)
    if (result?.success && result?.data) {
      searchResults.value = result.data
    } else {
      searchResults.value = []
    }
  } catch (error) {
    console.error('Search failed:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

const debouncedSearch = (searchTerm: string) => {
  clearPendingSearch()

  debounceTimer.value = window.setTimeout(() => {
    performSearch(searchTerm)
  }, 300)
}

const runCommand = (command: () => void) => {
  emit('close')
  command()
}

const goToChat = (chatId: string) => {
  runCommand(() => router.push(localePath(`/chat?id=${chatId}`)))
}

const formatDate = (dateInput?: Date | string) => {
  if (!dateInput) return ''

  const date = new Date(dateInput)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

watch(search, (newValue) => {
  if (!props.open) return

  debouncedSearch(newValue)
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      loadDefaultChats()
      return
    }

    resetSearchState()
  },
  { immediate: true },
)

onUnmounted(() => {
  clearPendingSearch()
})
</script>

<template>
  <div class="relative pb-11">
    <Command
      :class="
        cn(
          'rounded-none bg-transparent',
          '[&_[cmdk-input-wrapper]]:bg-input/50',
          '[&_[cmdk-input-wrapper]]:border-input',
          '[&_[cmdk-input]]:!h-9',
          '[&_[cmdk-input]]:py-0',
          '[&_[cmdk-input-wrapper]]:mb-0',
          '[&_[cmdk-input-wrapper]]:!h-9',
          '[&_[cmdk-input-wrapper]]:rounded-md',
          '[&_[cmdk-input-wrapper]]:border',
        )
      "
    >
      <div class="relative">
        <CommandInput
          v-model="search"
          :placeholder="t('chatbot.search.placeholder')"
        />
        <div
          v-if="isSearching || isLoadingDefault"
          class="pointer-events-none absolute top-1/2 right-3 z-10 flex -translate-y-1/2 items-center justify-center"
        >
          <Spinner class="text-muted-foreground size-4" />
        </div>
      </div>
      <CommandList class="no-scrollbar min-h-80 scroll-pt-2 scroll-pb-1.5">
        <CommandEmpty
          v-if="!displayedChats?.length"
          class="text-muted-foreground py-12 text-center text-sm"
        >
          <div class="flex flex-col items-center gap-2">
            <MessageSquare class="size-8 opacity-50" />
            <p>
              {{
                isSearching || isLoadingDefault
                  ? t('chatbot.search.loading')
                  : search.trim()
                    ? t('chatbot.search.noResults.search')
                    : t('chatbot.search.noResults.empty')
              }}
            </p>
          </div>
        </CommandEmpty>

        <CommandGroup
          v-show="displayedChats.length > 0"
          :heading="
            search.trim()
              ? t('chatbot.search.results.results')
              : t('chatbot.search.results.recentChats')
          "
          class="!p-0 [&_[cmdk-group-heading]]:scroll-mt-16 [&_[cmdk-group-heading]]:!p-3 [&_[cmdk-group-heading]]:!pb-1"
        >
          <CommandItem
            v-for="chat in displayedChats"
            :key="chat.id"
            :value="chat.searchKeywords || chat.title"
            :class="
              cn(
                'data-[selected=true]:border-input data-[selected=true]:bg-input/50 h-auto min-h-9 w-full min-w-0 overflow-hidden rounded-md border border-transparent !px-3 py-2',
              )
            "
            @select="() => goToChat(chat.id)"
          >
            <MessageSquare class="size-4 flex-shrink-0" />
            <div class="flex w-0 flex-1 min-w-0 flex-col overflow-hidden">
              <span class="truncate font-medium">
                {{ decodeHtmlEntities(chat.title) }}
              </span>
              <span v-if="chat.createdAt" class="text-muted-foreground text-xs">
                {{ formatDate(chat.createdAt) }}
              </span>
              <p
                v-if="chat.preview"
                class="text-muted-foreground mt-1 line-clamp-2 break-words text-xs"
              >
                {{ decodeHtmlEntities(chat.preview) }}
              </p>
              <span v-if="chat.searchKeywords" class="sr-only">
                {{ chat.searchKeywords }}
              </span>
            </div>
            <ArrowRight class="ml-2 size-4 flex-shrink-0 opacity-50" />
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>

    <div
      class="text-muted-foreground absolute inset-x-0 bottom-0 z-20 flex h-10 items-center gap-2 rounded-b-xl border-t border-t-neutral-100 bg-neutral-50 px-4 text-xs font-medium dark:border-t-neutral-700 dark:bg-neutral-800"
    >
      <div class="flex items-center gap-2">
        <Kbd class="flex items-center gap-1">
          <CornerDownLeft class="size-3" />
        </Kbd>
        <span>{{ t('chatbot.search.openChat') }}</span>
      </div>
    </div>
  </div>
</template>
