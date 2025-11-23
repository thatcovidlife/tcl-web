<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { ArrowRight, CornerDownLeft, History } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { useNavConfig } from '@/composables/useNavConfig'

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
// import Separator from '@/components/ui/separator/Separator.vue'
import Spinner from '@/components/ui/spinner/Spinner.vue'

interface Props {
  pages?: Array<{ href: string; label: string; description?: string }>
  navItems?: Array<{ href: string; label: string }>
}

const props = withDefaults(defineProps<Props>(), {
  pages: () => [],
  navItems: () => [],
})

const router = useRouter()
const { config: navConfig } = useNavConfig()

const open = ref(false)
const search = ref('')
const isSearching = ref(false)
const selectedType = ref<'page' | 'nav' | null>(null)

// Detect macOS for correct keyboard shortcut display
const isMac = computed(() => {
  if (import.meta.client) {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0
  }
  return false
})

// Flatten navigation items for search
const allNavItems = computed(() => {
  const items: Array<{
    href: string
    label: string
    type: string
    description?: string
  }> = []

  // Add custom nav items
  if (props.navItems && props.navItems.length > 0) {
    props.navItems.forEach((item) => {
      items.push({
        ...item,
        type: 'nav',
      })
    })
  }

  // Add navigation config items
  if (navConfig.value) {
    navConfig.value.forEach((section) => {
      if (section.children) {
        section.children.forEach((child) => {
          items.push({
            href: child.link,
            label: child.title,
            description: child.description,
            type: section.id,
          })
        })
      }
    })
  }

  // Add custom pages
  if (props.pages && props.pages.length > 0) {
    props.pages.forEach((page) => {
      items.push({
        ...page,
        type: 'page',
      })
    })
  }

  return items
})

// Group items by type
const groupedItems = computed(() => {
  const groups = new Map<string, typeof allNavItems.value>()

  allNavItems.value.forEach((item) => {
    const groupKey = item.type
    if (!groups.has(groupKey)) {
      groups.set(groupKey, [])
    }
    groups.get(groupKey)?.push(item)
  })

  return groups
})

const handlePageHighlight = (item: {
  href: string
  label: string
  type: string
}) => {
  selectedType.value = item.type === 'nav' ? 'nav' : 'page'
}

const runCommand = (command: () => void) => {
  open.value = false
  command()
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

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

// Reset search when dialog closes
watch(open, (isOpen) => {
  if (!isOpen) {
    search.value = ''
    selectedType.value = null
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button
        variant="ghost"
        size="lg"
        class="w-full relative flex items-center justify-between px-2"
        @click="open = true"
      >
        <span class="flex gap-1.5 items-center"><History /> History</span>
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
        <DialogTitle>Search documentation...</DialogTitle>
        <DialogDescription>Search for a page to navigate...</DialogDescription>
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
            placeholder="Search your chat history..."
          />
          <div
            v-if="isSearching"
            class="pointer-events-none absolute top-1/2 right-3 z-10 flex -translate-y-1/2 items-center justify-center"
          >
            <Spinner class="text-muted-foreground size-4" />
          </div>
        </div>
        <CommandList class="no-scrollbar min-h-80 scroll-pt-2 scroll-pb-1.5">
          <CommandEmpty class="text-muted-foreground py-12 text-center text-sm">
            {{ isSearching ? 'Searching...' : 'No results found.' }}
          </CommandEmpty>

          <template v-for="[groupKey, items] in groupedItems" :key="groupKey">
            <CommandGroup
              v-if="items.length > 0"
              :heading="groupKey.charAt(0).toUpperCase() + groupKey.slice(1)"
              class="!p-0 [&_[cmdk-group-heading]]:scroll-mt-16 [&_[cmdk-group-heading]]:!p-3 [&_[cmdk-group-heading]]:!pb-1"
            >
              <CommandItem
                v-for="item in items"
                :key="item.href"
                :value="`${groupKey} ${item.label}`"
                :class="
                  cn(
                    'data-[selected=true]:border-input data-[selected=true]:bg-input/50 h-9 rounded-md border border-transparent !px-3 font-medium',
                  )
                "
                @select="() => runCommand(() => router.push(item.href))"
              >
                <ArrowRight class="size-4" />
                {{ item.label }}
                <span
                  v-if="item.description"
                  class="text-muted-foreground ml-auto text-xs font-normal hidden md:inline"
                >
                  {{ item.description }}
                </span>
              </CommandItem>
            </CommandGroup>
          </template>
        </CommandList>
      </Command>
      <div
        class="text-muted-foreground absolute inset-x-0 bottom-0 z-20 flex h-10 items-center gap-2 rounded-b-xl border-t border-t-neutral-100 bg-neutral-50 px-4 text-xs font-medium dark:border-t-neutral-700 dark:bg-neutral-800"
      >
        <div class="flex items-center gap-2">
          <Kbd class="flex items-center gap-1">
            <CornerDownLeft class="size-3" />
          </Kbd>
          <span v-if="selectedType === 'page' || selectedType === 'nav'">
            Go to Page
          </span>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
