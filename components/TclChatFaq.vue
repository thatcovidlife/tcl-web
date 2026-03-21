<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { CircleQuestionMark } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const { locale, t } = useI18n()

const { width } = useWindowSize()
</script>
<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button
        :size="width < 1024 ? 'icon' : 'lg'"
        :variant="width < 1024 ? 'outline' : 'ghost'"
        :class="
          cn('w-full justify-start px-2 gap-1.5 items-center flex', {
            'rounded-full mb-2': width < 1024,
          })
        "
      >
        <CircleQuestionMark />
        <span class="hidden lg:inline">{{ t('chatbot.menu.faq') }}</span>
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t('chatbot.menu.faq') }}</DialogTitle>
      </DialogHeader>
      <TclChatFaqContent :locale="locale" />
    </DialogContent>
  </Dialog>
</template>
