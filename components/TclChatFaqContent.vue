<script setup lang="ts">
import { toRef } from 'vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import { SERIALIZERS } from '@/assets/constants/serializers'
import FAQ_QUERY from '@/sanity/queries/faq.sanity'
import type { FAQ_QUERYResult } from '@/sanity/types'

const props = defineProps<{
  locale: string
}>()

const locale = toRef(props, 'locale')

const { data: faqData } = await useSanityQuery<FAQ_QUERYResult>(FAQ_QUERY, {
  locale,
  category: 'chatbot',
})
</script>

<template>
  <Accordion
    type="single"
    collapsible
    class="max-h-[75vh] w-full overflow-y-auto"
  >
    <AccordionItem
      v-for="(faq, index) in faqData"
      :key="index"
      :value="faq.id!"
    >
      <AccordionTrigger
        class="w-full border-b border-b-muted px-2 py-3 text-left hover:bg-muted/50"
      >
        {{ faq.title }}
      </AccordionTrigger>
      <AccordionContent
        class="prose prose-invert prose-a:text-primary hover:prose-a:text-primary-hover px-2 py-4 [&>p]:mb-4"
      >
        <SanityContent
          v-if="faq?.contents"
          :blocks="<any>faq?.contents"
          :serializers="SERIALIZERS"
        />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
