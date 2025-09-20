<script setup lang="ts">
import type { Tag } from '@/lib/types'

defineProps<{
  free?: boolean
  limited?: boolean
  online?: boolean
  premium?: boolean
  tags: Tag[]
}>()

const localePath = useLocalePath()
const { t } = useI18n()
</script>

<template>
  <div class="flex flex-wrap">
    <Badge v-if="free" class="uppercase tracking-widest mr-1.5 mb-1">
      {{ t('article.free') }}
    </Badge>
    <Badge v-if="limited" class="uppercase tracking-widest mr-1.5 mb-1">
      {{ t('article.limited') }}
    </Badge>
    <Badge v-if="online" class="uppercase tracking-widest mr-1.5 mb-1">
      {{ t('article.online') }}
    </Badge>
    <Badge v-if="premium" class="uppercase tracking-widest mr-1.5 mb-1">
      {{ t('article.locked') }}
    </Badge>
    <NuxtLink
      v-for="{ label, slug } in tags"
      :key="slug"
      :to="localePath(`/tag/${slug}?offset=0&limit=5`)"
      target="_self"
    >
      <Badge class="uppercase tracking-widest mr-1.5 mb-1" variant="secondary">
        {{ label }}
      </Badge>
    </NuxtLink>
  </div>
</template>
