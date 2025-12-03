<script setup lang="ts">
import { motion } from 'motion-v'
import { AlertCircle } from 'lucide-vue-next'

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <motion.div
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.5 }"
    class="container max-w-3xl py-8 md:py-16 mx-auto mb-8"
  >
    <TclSeo
      :description="t('blocked.description')"
      :title="t('blocked.title')"
    />

    <div class="flex flex-col items-center text-center space-y-6">
      <AlertCircle class="w-24 h-24 text-destructive" />

      <h1 class="font-pt antialiased text-4xl leading-[42px] font-bold">
        {{ t('blocked.title') }}
      </h1>

      <p class="text-lg text-muted-foreground max-w-xl">
        {{ t('blocked.description') }}
      </p>

      <div class="pt-4">
        <NuxtLink :to="localePath('/')" class="text-primary hover:underline">
          {{ t('blocked.goHome') }}
        </NuxtLink>
      </div>
    </div>
  </motion.div>
</template>
