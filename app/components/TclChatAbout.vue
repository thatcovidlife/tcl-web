<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { InfoIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/app/utils'

import { SERIALIZERS } from '@/assets/constants/serializers'
import POLICY_QUERY from '@/sanity/queries/policy.sanity'
import type { POLICY_QUERYResult } from '@/sanity/types'

const { locale, t } = useI18n()

const { data: policyData } = await useSanityQuery<POLICY_QUERYResult>(
  POLICY_QUERY,
  {
    locale,
    policyType: 'Chatbot Disclaimer',
  },
)

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
        <InfoIcon />
        <span class="hidden lg:inline">{{ t('chatbot.menu.about') }}</span>
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t('chatbot.menu.about') }}</DialogTitle>
      </DialogHeader>
      <div
        class="prose prose-invert prose-a:text-primary hover:prose-a:text-primary-hover [&>p]:mb-4 max-h-[50vh] overflow-y-auto"
      >
        <SanityContent
          v-if="policyData?.contents"
          :blocks="<any>policyData?.contents"
          :serializers="SERIALIZERS"
        />
      </div>
    </DialogContent>
  </Dialog>
</template>
