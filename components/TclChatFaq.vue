<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { CircleQuestionMark } from 'lucide-vue-next'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import { SERIALIZERS } from '@/assets/constants/serializers'
import FAQ_QUERY from '@/sanity/queries/faq.sanity'
import type { FAQ_QUERYResult } from '@/sanity/types'

const { locale, t } = useI18n()

const { data: faqData } = await useSanityQuery<FAQ_QUERYResult>(FAQ_QUERY, {
  locale,
  category: 'chatbot',
})

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
      <Accordion
        type="single"
        collapsible
        class="w-full max-h-[75vh] overflow-y-auto"
      >
        <AccordionItem
          v-for="(faq, index) in faqData"
          :key="index"
          :value="faq.id!"
        >
          <AccordionTrigger
            class="w-full py-3 px-2 text-left border-b border-b-muted hover:bg-muted/50"
          >
            {{ faq.title }}
          </AccordionTrigger>
          <AccordionContent
            class="prose prose-invert prose-a:text-primary hover:prose-a:text-primary-hover [&>p]:mb-4 px-2 py-4"
          >
            <SanityContent
              v-if="faq?.contents"
              :blocks="<any>faq?.contents"
              :serializers="SERIALIZERS"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </DialogContent>
  </Dialog>
</template>
