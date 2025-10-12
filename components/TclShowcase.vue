<script setup lang="ts">
import { cn } from '@/lib/utils'
import type { LATEST_PUBLICATIONS_QUERYResult } from '@/sanity/types'

defineProps<{
  docs: LATEST_PUBLICATIONS_QUERYResult['showcase'] | []
}>()

const spans = ref([
  'md:col-span-2 md:row-span-3',
  'md:row-span-2',
  'md:row-span-2',
  'md:col-span-2 md:row-span-3',
  'md:col-span-2 md:row-span-2',
])
</script>

<template>
  <div
    class="grid gap-6 md:gap-2 md:grid-cols-4 md:grid-rows-5 w-full min-h-[500px]"
  >
    <NuxtLink
      v-for="({ id, link, title, visual }, index) in docs"
      :key="id"
      :href="`${link}`"
      target="_blank"
      :class="
        cn(
          'group bg-muted min-h-[300px] md:min-h-min overflow-hidden relative',
          spans[index],
        )
      "
    >
      <h3 class="peer absolute bottom-0 left-0 z-[1] m-3">
        <span
          :class="
            cn(
              'bg-stone-800 font-title text-white transition-colors duration-200 group-hover:bg-primary',
              index === 0
                ? 'text-xl md:text-lg lg:text-xl xl:text-3xl leading-8 md:leading-7 lg:leading-9 xl:leading-[3.1rem]'
                : 'text-xl md:text-base lg:text-lg xl:text-xl leading-8 md:leading-6 lg:leading-7 xl:leading-8',
            )
          "
        >
          {{ title }}
        </span>
      </h3>
      <div
        class="w-full h-full bg-cover bg-center transition-transform ease-out duration-200 scale-[1.07] hover:scale-[1.0] peer-has-[:hover]:scale-[1.0]"
        :style="{
          backgroundImage: `url(${visual || '/tcl-fallback-169.jpg'})`,
        }"
      >
        &nbsp;
      </div>
    </NuxtLink>
  </div>
</template>
