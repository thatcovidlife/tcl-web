<script setup lang="ts">
import { useFooterConfig } from '@/composables/useFooterConfig'
import { useMobileButtons } from '@/composables/useMobileButtons'

const { t } = useI18n()

const { config } = useFooterConfig()
const { ANDROID_URL, IOS_URL, appleStoreBtn, googlePlayBtn } =
  useMobileButtons()
</script>

<template>
  <footer class="pt-12 pb-32">
    <div class="container grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div
        :key="`footer-column-${columnIndex}`"
        v-for="({ title, contents }, columnIndex) in config"
      >
        <h4 class="uppercase text-sm font-bold tracking-widest mb-5">
          {{ title }}
        </h4>
        <ul>
          <li
            v-for="(
              { label, href, icon, target, external }, rowIndex
            ) in contents"
            :key="`footer-col-${columnIndex}-row-${rowIndex}`"
            class="text-[13px] mb-2.5 h-5"
          >
            <NuxtLink
              :to="href"
              :target="target"
              :external="external"
              class="hover:underline text-primary hover:brightness-90 inline-flex items-center"
            >
              <Icon v-if="icon" :name="icon" class="mr-1.5" />
              {{ label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
      <div
        class="flex flex-col items-start lg:items-end justify-end lg:justify-center"
      >
        <NuxtLink :href="IOS_URL" target="_blank" class="mb-2 lg:mr-0.5">
          <NuxtImg
            alt="Apple Store logo"
            class="h-[45px]"
            :src="appleStoreBtn"
          />
        </NuxtLink>
        <NuxtLink :href="ANDROID_URL" target="_blank">
          <NuxtImg
            alt="Google Play logo"
            class="h-[45px]"
            :src="googlePlayBtn"
          />
        </NuxtLink>
      </div>
    </div>
    <div class="container mt-4">
      <Separator />
      <p class="mt-6 text-xs">
        &copy; 2023 - {{ new Date().getFullYear() }} | {{ t('layout.tcl') }} |
        {{ t('layout.rights') }}.
      </p>
    </div>
  </footer>
</template>
