<script setup lang="ts">
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { useAttrs } from 'vue'

const attrs = useAttrs()
</script>

<template>
  <DropdownMenu v-bind="attrs">
    <slot />
  </DropdownMenu>
</template>
