<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'

const { t } = useI18n()

const props = defineProps<{
  defaultValue?: string
  modelValue?: string
  class?: HTMLAttributes['class']
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <form class="ml-auto flex-1 sm:flex-initial">
    <div class="relative w-full max-w-sm items-center">
      <Input
        v-model="modelValue"
        id="search"
        type="text"
        :placeholder="t('layout.search')"
        class="pl-9 sm:w-[250px] md:w-[150px] lg:w-[250px]"
      />
      <span
        class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
      >
        <Icon name="iconamoon:search" size="20" class="text-muted-foreground" />
      </span>
    </div>
  </form>
</template>
