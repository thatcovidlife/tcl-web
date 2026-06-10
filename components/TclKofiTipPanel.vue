<script setup lang="ts">
const { t } = useI18n()

const koFiPageUrl = 'https://ko-fi.com/thatcovidlife'
const koFiEmbedUrl =
  'https://ko-fi.com/thatcovidlife/?hidefeed=true&widget=true&embed=true'
</script>

<template>
  <div class="space-y-3">
    <ClientOnly>
      <div class="kofi-tip-panel-shell">
        <div class="kofi-tip-panel-viewport">
          <iframe
            :src="koFiEmbedUrl"
            :title="t('donate.embed.title')"
            class="kofi-tip-panel-iframe"
            allowtransparency="true"
            loading="eager"
          />
        </div>
      </div>
      <template #fallback>
        <div
          class="flex h-[560px] items-center justify-center rounded-lg border border-border bg-muted/40 px-6 text-center text-sm text-muted-foreground"
        >
          {{ t('donate.embed.loading') }}
        </div>
      </template>
    </ClientOnly>

    <p class="text-center text-xs leading-5 text-muted-foreground">
      {{ t('donate.embed.fallback') }}
      <NuxtLink
        :to="koFiPageUrl"
        external
        target="_blank"
        rel="noopener noreferrer"
        class="font-medium text-primary underline-offset-4 hover:underline"
      >
        {{ t('donate.embed.fallbackLink') }}
      </NuxtLink>
    </p>
  </div>
</template>

<style scoped>
.kofi-tip-panel-shell {
  display: flex;
  justify-content: center;
  padding-top: 1.5rem;
}

.kofi-tip-panel-viewport {
  width: min(100%, 25rem);
  overflow: hidden;
  border-radius: 0.5rem;
}

.kofi-tip-panel-iframe {
  display: block;
  width: min(36rem, calc(100vw - 2rem));
  max-width: none;
  height: 36.5rem;
  margin-left: 50%;
  border: 0;
  background: transparent;
  transform: translateX(-50%);
}

@media (max-width: 480px) {
  .kofi-tip-panel-shell {
    padding-top: 1rem;
  }

  .kofi-tip-panel-viewport {
    width: 100%;
  }

  .kofi-tip-panel-iframe {
    width: 100%;
    margin-left: 0;
    transform: none;
  }
}
</style>
