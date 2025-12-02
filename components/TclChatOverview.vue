<script setup lang="ts">
import { animate, motion } from 'motion-v'
const colorMode = useColorMode()
const { t } = useI18n()
</script>
<template>
  <motion.div
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    :transition="{ duration: 0.5, delay: 0.2 }"
    class="flex flex-col items-center justify-end"
  >
    <div class="h-[60px] mb-4">
      <ClientOnly>
        <NuxtImg
          :src="`/covid-life-v3-${colorMode.value}.png`"
          alt="That Covid Life logo"
          class="w-64"
        />
      </ClientOnly>
    </div>

    <p class="text-center text-sm text-muted-foreground">
      {{ t('chatbot.overview') }}
    </p>
  </motion.div>
</template>
