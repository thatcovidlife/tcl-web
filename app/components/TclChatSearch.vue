<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import {
  ArrowRight,
  CornerDownLeft,
  History,
  MessageSquare,
} from 'lucide-vue-next'
import { cn, decodeHtmlEntities } from '@/app/utils'
import { useApiRoutes } from '@/composables/useApiRoutes'

import Button from '@/components/ui/button/Button.vue'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import Kbd from '@/components/ui/kbd/Kbd.vue'
import KbdGroup from '@/components/ui/kbd/KbdGroup.vue'
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

const router = useRouter()
const { getUserChats, searchChats } = useApiRoutes()
const { user } = useUserSession()
const { t } = useI18n()
const localePath = useLocalePath()

const open = ref(false)
const search = ref('')
const isSearching = ref(false)
const isLoadingDefault = ref(false)
const defaultChats = ref<Chat[]>([])
const searchResults = ref<SearchResultChat[]>([])
const debounceTimer = ref<number | null>(null)

// Detect macOS for correct keyboard shortcut display
const isMac = computed(() => {
  if (import.meta.client) {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0
  }
  return false
})

// Transform search results to match chat format
const transformedSearchResults = computed(() => {
  return searchResults.value?.map((result) => ({
    id: result.chatId,
    title: result.title,
    createdAt: result.createdAt,
    preview: result.preview,
    searchKeywords: [result.title, result.preview].filter(Boolean).join(' '),
  }))
})

// Compute which chats to display
const displayedChats = computed(() => {
  return search.value.trim()
    ? [...transformedSearchResults.value]
    : defaultChats.value
})

// Load default chats (3 most recent)
const loadDefaultChats = async () => {
  if (!user.value) return

  isLoadingDefault.value = true
  try {
    const result = await getUserChats(3, 0)
    if (result?.data) {
      defaultChats.value = result.data
    }
  } catch (error) {
    console.error('Failed to load default chats:', error)
    defaultChats.value = []
  } finally {
    isLoadingDefault.value = false
  }
}

// Debounced search handler
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

// Debounce search input
const debouncedSearch = (searchTerm: string) => {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }

  debounceTimer.value = window.setTimeout(() => {
    performSearch(searchTerm)
  }, 300)
}

const runCommand = (command: () => void) => {
  open.value = false
  command()
}

// Navigate to chat
const goToChat = (chatId: string) => {
  runCommand(() => router.push(localePath(`/chat?id=${chatId}`)))
}

// Format date for display
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

// Keyboard shortcuts
const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
    if (
      (e.target instanceof HTMLElement && e.target.isContentEditable) ||
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement
    ) {
      return
    }

    e.preventDefault()
    open.value = !open.value
  }
}

// Watch search input for debounced search
watch(search, (newValue) => {
  debouncedSearch(newValue)
})

// Load default chats when dialog opens
watch(open, (isOpen) => {
  if (isOpen) {
    loadDefaultChats()
  } else {
    search.value = ''
    searchResults.value = []
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value)
      debounceTimer.value = null
    }
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button
        size="icon"
        variant="outline"
        class="w-full flex justify-start px-2 gap-1.5 items-center lg:hidden rounded-full mb-2"
      >
        <History />
      </Button>
      <Button
        variant="ghost"
        size="lg"
        class="w-full relative hidden lg:flex items-center justify-between px-2"
        @click="open = true"
      >
        <span class="flex gap-1.5 items-center"
          ><History /> {{ t('chatbot.menu.history') }}</span
        >
        <!-- <span class="inline-flex lg:hidden">Search...</span> -->
        <div class="gap-1 sm:flex">
          <KbdGroup>
            <Kbd class="border">{{ isMac ? '⌘' : 'Ctrl' }}</Kbd>
            <Kbd class="border">K</Kbd>
          </KbdGroup>
        </div>
      </Button>
    </DialogTrigger>
    <DialogContent
      class="rounded-xl border-none bg-clip-padding p-2 pb-11 shadow-2xl ring-4 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-neutral-800"
    >
      <DialogHeader class="sr-only">
        <DialogTitle>{{ t('chatbot.search.title') }}</DialogTitle>
        <DialogDescription>{{
          t('chatbot.search.description')
        }}</DialogDescription>
      </DialogHeader>
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
                  'data-[selected=true]:border-input data-[selected=true]:bg-input/50 h-auto min-h-9 rounded-md border border-transparent !px-3 py-2',
                )
              "
              @select="() => goToChat(chat.id)"
            >
              <MessageSquare class="size-4 flex-shrink-0" />
              <div class="flex flex-col flex-1 min-w-0">
                <span class="font-medium truncate">{{
                  decodeHtmlEntities(chat.title)
                }}</span>
                <span
                  v-if="chat.createdAt"
                  class="text-muted-foreground text-xs"
                >
                  {{ formatDate(chat.createdAt) }}
                </span>
                <p
                  v-if="chat.preview"
                  class="text-muted-foreground mt-1 line-clamp-2 text-xs"
                >
                  {{ decodeHtmlEntities(chat.preview) }}
                </p>
                <span v-if="chat.searchKeywords" class="sr-only">
                  {{ chat.searchKeywords }}
                </span>
              </div>
              <ArrowRight class="size-4 flex-shrink-0 ml-2 opacity-50" />
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
    </DialogContent>
  </Dialog>
</template>
