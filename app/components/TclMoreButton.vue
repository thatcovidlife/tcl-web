<script setup lang="ts">
import type { Target } from '@/lib/types'
import { cn } from '@/app/utils'
import type { ButtonVariants } from './ui/button'

defineProps<{
  extra?: string
  label?: string
  link?: string
  size?: ButtonVariants['size']
  variant?: ButtonVariants['variant']
  target?: Target
}>()

const localePath = useLocalePath()
</script>

<template>
  <template v-if="link">
    <NuxtLink
      :to="target === '_blank' ? link : localePath(link)"
      :target="target || '_self'"
    >
      <Button :size="size" :variant="variant" :class="cn('group', extra)">
        {{ label }}&nbsp;
        <Icon
          name="material-symbols:arrow-right-alt-rounded"
          :size="14"
          class="transition duration-150 group-hover:translate-x-1"
        />
      </Button>
    </NuxtLink>
  </template>
  <template v-else>
    <Button :size="size" :variant="variant" :class="cn('group', extra)">
      <slot />
    </Button>
  </template>
</template>
