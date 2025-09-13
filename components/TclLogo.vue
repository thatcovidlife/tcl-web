<script setup leng="ts">
import { motion } from 'motion-v'
const colorMode = useColorMode()
const theme = computed(() => colorMode.value)
</script>

<template>
  <div class="w-[46px] h-[46px]">
    <ClientOnly>
      <motion.div
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :transition="{
          duration: 1,
          ease: 'linear',
        }"
      >
        <NuxtImg
          class="transition-all duration-300 hover:opacity-70"
          :src="`/tcl-logo-big-transparent-${theme}.png`"
          :height="46"
          :width="46"
          alt="That Covid Life"
        />
      </motion.div>
    </ClientOnly>
  </div>
</template>
