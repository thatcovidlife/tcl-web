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
    class="grid min-h-[500px] w-full gap-6 md:grid-cols-4 md:grid-rows-5 md:gap-3"
  >
    <NuxtLink
      v-for="({ id, link, title, visual }, index) in docs"
      :key="id"
      :href="`${link}`"
      target="_blank"
      :class="
        cn(
          'group relative min-h-[300px] overflow-hidden rounded-[2rem] bg-muted md:min-h-min',
          spans[index],
        )
      "
    >
      <div class="absolute inset-x-0 bottom-0 z-[1] p-4 md:p-5">
        <span
          :class="
            cn(
              'inline bg-background px-2.5 py-1 font-title text-foreground shadow-sm ring-1 ring-black/5 transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground',
              index === 0
                ? 'text-xl leading-8 md:text-lg md:leading-7 lg:text-xl lg:leading-9 xl:text-3xl xl:leading-[3.1rem]'
                : 'text-xl leading-8 md:text-base md:leading-6 lg:text-lg lg:leading-7 xl:text-xl xl:leading-8',
            )
          "
        >
          {{ title }}
        </span>
      </div>
      <div
        class="h-full w-full scale-[1.03] bg-cover bg-center transition-transform duration-300 ease-out group-hover:scale-100"
        :style="{
          backgroundImage: `url(${visual || '/tcl-fallback-169.jpg'})`,
        }"
      >
        &nbsp;
      </div>
    </NuxtLink>
  </div>
</template>
