<script setup lang="ts">
import { MenuIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const { locale, t } = useI18n()
const localePath = useLocalePath()

type ActionMenuDrawer = 'history' | 'about' | 'faq'

const emit = defineEmits<{
  (e: 'new-chat'): void
}>()

const activeDrawer = ref<ActionMenuDrawer | null>(null)

const drawerOpen = computed({
  get: () => activeDrawer.value !== null,
  set: (isOpen: boolean) => {
    if (!isOpen) {
      activeDrawer.value = null
    }
  },
})

const drawerTitle = computed(() => {
  if (activeDrawer.value === 'history') {
    return t('chatbot.search.title')
  }

  if (activeDrawer.value === 'about') {
    return t('chatbot.menu.about')
  }

  if (activeDrawer.value === 'faq') {
    return t('chatbot.menu.faq')
  }

  return ''
})

const drawerDescription = computed(() => {
  if (activeDrawer.value === 'history') {
    return t('chatbot.search.description')
  }

  return ''
})

const openDrawer = (panel: ActionMenuDrawer) => {
  activeDrawer.value = panel
}
</script>

<template>
  <Drawer v-model:open="drawerOpen">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline" size="sm"
          ><MenuIcon />{{ t('chatbot.menu.title') }}</Button
        >
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem @select="openDrawer('history')">
            {{ t('chatbot.menu.history') }}
          </DropdownMenuItem>
          <DropdownMenuItem @select="openDrawer('about')">
            {{ t('chatbot.menu.about') }}
          </DropdownMenuItem>
          <DropdownMenuItem @select="openDrawer('faq')">
            {{ t('chatbot.menu.faq') }}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <NuxtLink
              :to="localePath('/support')"
              target="_blank"
              class="h-full w-full"
            >
              {{ t('chatbot.menu.support') }}
            </NuxtLink>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem @click="emit('new-chat')">
            {{ t('chatbot.menu.new') }}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>

    <DrawerContent class="max-h-[85vh]">
      <DrawerHeader class="border-b">
        <DrawerTitle>{{ drawerTitle }}</DrawerTitle>
        <DrawerDescription v-if="drawerDescription">
          {{ drawerDescription }}
        </DrawerDescription>
      </DrawerHeader>

      <div class="overflow-y-auto p-4">
        <TclChatHistoryContent
          v-if="activeDrawer === 'history'"
          :open="drawerOpen"
          @close="drawerOpen = false"
        />
        <TclChatAboutContent
          v-else-if="activeDrawer === 'about'"
          :locale="locale"
        />
        <TclChatFaqContent
          v-else-if="activeDrawer === 'faq'"
          :locale="locale"
        />
      </div>
    </DrawerContent>
  </Drawer>
</template>
