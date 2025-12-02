<script setup lang="ts">
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PlusIcon } from 'lucide-vue-next'
import { useAttrs } from 'vue'

import PromptInputButton from './PromptInputButton.vue'

const attrs = useAttrs()
</script>

<template>
  <DropdownMenuTrigger as-child>
    <PromptInputButton v-bind="attrs">
      <slot>
        <PlusIcon class="size-4" />
      </slot>
    </PromptInputButton>
  </DropdownMenuTrigger>
</template>
