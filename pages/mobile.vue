<script setup>
import { useMobileButtons } from '@/composables/useMobileButtons'
import { motion } from 'motion-v'

import { Card, CardContent, CardHeader } from '@/components/ui/card'

const { locale } = useI18n()
const { ANDROID_URL, IOS_URL, appleStoreBtn, googlePlayBtn } =
  useMobileButtons()
</script>

<template>
  <div class="container mx-auto px-4 py-8 mb-8">
    <section class="grid grid-cols-[67%_auto] gap-8 items-center">
      <div class="flex flex-col justify-center">
        <h1 class="text-4xl font-bold mb-4 font-pt text-center lg:text-left">
          <span v-text="$t('mobile.header')" /><br />
          <span class="text-primary" v-text="$t('mobile.subheader')" />
        </h1>
        <div
          class="flex items-center justify-center lg:justify-start flex-col sm:flex-row"
        >
          <NuxtLink :to="ANDROID_URL" target="_blank">
            <NuxtImg
              :src="googlePlayBtn"
              class="h-[63px] mb-4 sm:mb-0 sm:mr-3 es:h-[62px]"
              :class="locale"
            />
          </NuxtLink>
          <NuxtLink :to="IOS_URL" target="_blank">
            <NuxtImg :src="appleStoreBtn" class="h-[60px]" :class="locale" />
          </NuxtLink>
        </div>
      </div>
      <div>
        <motion.div
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :transition="{ duration: 0.8 }"
        >
          <NuxtImg class="w-full" src="/app-promo-transparent.png" />
        </motion.div>
      </div>
    </section>
    <section class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
      <motion.div
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5 }"
      >
        <Card>
          <CardHeader>
            <h3
              class="font-pt text-xl font-semibold tracking-wide"
              v-text="$t('mobile.details.informed.title')"
            />
          </CardHeader>
          <CardContent>
            <p
              class="text-sm"
              v-text="$t('mobile.details.informed.description')"
            />
          </CardContent>
        </Card>
      </motion.div>
      <motion.div
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.1 }"
      >
        <Card>
          <CardHeader>
            <h3
              class="font-pt text-xl font-semibold tracking-wide"
              v-text="$t('mobile.details.archive.title')"
            />
          </CardHeader>
          <CardContent>
            <p
              class="text-sm"
              v-text="$t('mobile.details.archive.description')"
            />
          </CardContent>
        </Card>
      </motion.div>
      <motion.div
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.2 }"
      >
        <Card>
          <CardHeader>
            <h3
              class="font-pt text-xl font-semibold tracking-wide"
              v-text="$t('mobile.details.contribute.title')"
            />
          </CardHeader>
          <CardContent>
            <p
              class="text-sm"
              v-text="$t('mobile.details.contribute.description')"
            />
          </CardContent>
        </Card>
      </motion.div>
    </section>
  </div>
</template>
