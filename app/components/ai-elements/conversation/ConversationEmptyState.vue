<script setup lang="ts">
import { cn } from '@/app/utils'
import { computed } from 'vue'
import { useAttrs, useSlots } from 'vue'
import type { Component } from 'vue'

const props = withDefaults(
  defineProps<{
    class?: string
    title?: string
    description?: string
    icon?: Component
    iconClass?: string
  }>(),
  {
    class: undefined,
    title: 'No messages yet',
    description: 'Start a conversation to see messages here',
    icon: undefined,
    iconClass: undefined,
  },
)

const attrs = useAttrs()
const slots = useSlots()
const hasDefaultSlot = computed(() => Boolean(slots.default))
</script>

<template>
  <div
    v-bind="attrs"
    :class="
      cn(
        'flex size-full flex-col items-center justify-center gap-3 p-8 text-center',
        props.class,
      )
    "
  >
    <slot v-if="hasDefaultSlot" />
    <template v-else>
      <div v-if="props.icon" class="text-muted-foreground">
        <component :is="props.icon" :class="cn('size-6', props.iconClass)" />
      </div>
      <div class="space-y-1">
        <h3 class="text-sm font-medium">{{ props.title }}</h3>
        <p v-if="props.description" class="text-sm text-muted-foreground">
          {{ props.description }}
        </p>
      </div>
    </template>
  </div>
</template>
