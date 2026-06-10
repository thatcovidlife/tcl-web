<script setup lang="ts">
import { ArrowRight, Info, X } from 'lucide-vue-next'
import { computed, onMounted, shallowRef } from 'vue'

const DISMISS_STORAGE_KEY = 'tcl-donate-banner-dismissed'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const isReady = shallowRef(false)
const isDismissed = shallowRef(false)

const donatePath = computed(() => localePath('/donate'))
const isDonatePage = computed(
  () => route.path.replace(/\/$/, '') === donatePath.value.replace(/\/$/, ''),
)
const shouldShowBanner = computed(
  () => isReady.value && !isDismissed.value && !isDonatePage.value,
)

onMounted(() => {
  try {
    isDismissed.value =
      window.sessionStorage.getItem(DISMISS_STORAGE_KEY) === 'true'
  } catch {
    isDismissed.value = false
  }

  isReady.value = true
})

function dismissBanner() {
  isDismissed.value = true

  try {
    window.sessionStorage.setItem(DISMISS_STORAGE_KEY, 'true')
  } catch {
    // Keep the in-page dismissal even when sessionStorage is unavailable.
  }
}
</script>

<template>
  <aside
    v-if="shouldShowBanner"
    class="border-b border-primary/25 bg-primary text-primary-foreground"
    role="status"
    :aria-label="t('layout.donateBanner.ariaLabel')"
  >
    <div
      class="container flex min-h-11 flex-col gap-2 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex min-w-0 flex-1 items-start gap-2 sm:items-center">
        <Info :size="18" class="mt-0.5 shrink-0 sm:mt-0" aria-hidden="true" />
        <p class="leading-5 sm:truncate">
          {{ t('layout.donateBanner.message') }}
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-2 self-end sm:self-center">
        <Button
          as-child
          size="sm"
          variant="secondary"
          class="h-7 bg-primary-foreground px-3 text-primary hover:bg-primary-foreground/90"
        >
          <NuxtLink :to="donatePath">
            {{ t('layout.donateBanner.cta') }}
            <ArrowRight :size="14" aria-hidden="true" />
          </NuxtLink>
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          class="size-7 rounded-full text-primary-foreground/85 hover:bg-primary-foreground/15 hover:text-primary-foreground"
          :aria-label="t('layout.donateBanner.dismiss')"
          @click="dismissBanner"
        >
          <X :size="16" aria-hidden="true" />
        </Button>
      </div>
    </div>
  </aside>
</template>
