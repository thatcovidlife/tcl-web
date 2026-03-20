<script setup lang="ts">
import { MenuIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const { t } = useI18n()
const localePath = useLocalePath()

const emit = defineEmits<{
  (e: 'new-chat'): void
}>()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="sm"
        ><MenuIcon />{{ t('chatbot.menu.title') }}</Button
      >
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-56" align="start">
      <DropdownMenuGroup>
        <DropdownMenuItem> {{ t('chatbot.menu.history') }} </DropdownMenuItem>
        <DropdownMenuItem> {{ t('chatbot.menu.about') }} </DropdownMenuItem>
        <DropdownMenuItem> {{ t('chatbot.menu.faq') }} </DropdownMenuItem>
        <DropdownMenuItem>
          <NuxtLink
            :to="localePath('/support')"
            target="_blank"
            class="w-full h-full"
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
</template>
