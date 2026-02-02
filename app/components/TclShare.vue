<script setup lang="ts">
defineProps<{
  title: string
  url: string
}>()

import { useShareLink } from 'vue3-social-sharing'
import { Share2 } from 'lucide-vue-next'
const { shareLink } = useShareLink()

const { t } = useI18n()
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button size="icon" variant="outline" class="rounded-full">
        <Share2 />
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" class="w-auto">
      <div class="flex flex-col">
        <NuxtLink
          href="#"
          variant="link"
          class="text-sm hover:text-primary transition-all items-center flex gap-1"
          @click="
            () =>
              shareLink({
                network: 'facebook',
                title,
                url,
                hashtags: 'ThatCovidLife',
              })
          "
        >
          <Icon name="bi:facebook" class="w-4 h-4" />
          {{ t('share.action', { name: 'Facebook' }) }}
        </NuxtLink>
        <Separator class="my-2" />
        <NuxtLink
          href="#"
          variant="link"
          class="text-sm hover:text-primary transition-all items-center flex gap-1"
          @click="
            () =>
              shareLink({
                network: 'twitter',
                title,
                url,
                hashtags: 'ThatCovidLife',
              })
          "
        >
          <Icon name="bi:twitter" class="w-4 h-4" />
          {{ t('share.action', { name: 'Twitter' }) }}
        </NuxtLink>
        <Separator class="my-2" />
        <NuxtLink
          href="#"
          variant="link"
          class="text-sm hover:text-primary transition-all items-center flex gap-1"
          @click="
            () =>
              shareLink({
                network: 'reddit',
                title,
                url,
                hashtags: 'ThatCovidLife',
              })
          "
        >
          <Icon name="bi:reddit" class="w-4 h-4" />
          {{ t('share.action', { name: 'Reddit' }) }}
        </NuxtLink>
        <Separator class="my-2" />
        <NuxtLink
          href="#"
          variant="link"
          class="text-sm hover:text-primary transition-all items-center flex gap-1"
          @click="
            () =>
              shareLink({
                network: 'threads',
                title,
                url,
                hashtags: 'ThatCovidLife',
              })
          "
        >
          <Icon name="bi:threads" class="w-4 h-4" />
          {{ t('share.action', { name: 'Threads' }) }}
        </NuxtLink>
        <Separator class="my-2" />
        <NuxtLink
          href="#"
          variant="link"
          class="text-sm hover:text-primary transition-all items-center flex gap-1"
          @click="
            () =>
              shareLink({
                network: 'whatsapp',
                title,
                url,
                hashtags: 'ThatCovidLife',
              })
          "
        >
          <Icon name="bi:whatsapp" class="w-4 h-4" />
          {{ t('share.action', { name: 'WhatsApp' }) }}
        </NuxtLink>
        <Separator class="my-2" />
        <NuxtLink
          href="#"
          variant="link"
          class="text-sm hover:text-primary transition-all items-center flex gap-1"
          @click="
            () =>
              shareLink({
                network: 'email',
                title,
                url,
                hashtags: 'ThatCovidLife',
              })
          "
        >
          <Icon name="ic:round-alternate-email" class="w-4 h-4" />
          {{ t('share.send') }}
        </NuxtLink>
      </div>
    </PopoverContent>
  </Popover>
</template>
