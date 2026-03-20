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
        <DropdownMenuItem> {{ t('chatbot.menu.support') }} </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem> {{ t('chatbot.menu.new') }} </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
