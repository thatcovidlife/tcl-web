<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { HTMLAttributes } from 'vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/app/utils'

defineOptions({ inheritAttrs: false, name: 'MessageAvatar' })

const props = defineProps<{
  src: string
  name?: string
  class?: HTMLAttributes['class']
}>()

const attrs = useAttrs()

const avatarClasses = computed(() =>
  cn(
    'size-8 ring-1 ring-border',
    props.class,
    attrs.class as HTMLAttributes['class'],
  ),
)

const restAttrs = computed(() => {
  const { class: _class, ...rest } = attrs as Record<string, unknown>
  return rest
})

const fallbackText = computed(() => {
  const trimmedName = props.name?.trim()
  if (trimmedName && trimmedName.length > 0) {
    return trimmedName.slice(0, 2)
  }

  return 'ME'
})
</script>

<template>
  <Avatar :class="avatarClasses" v-bind="restAttrs">
    <AvatarImage alt="" class="mb-0 mt-0" :src="props.src" />
    <AvatarFallback>{{ fallbackText }}</AvatarFallback>
  </Avatar>
</template>
