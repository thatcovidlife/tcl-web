<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

defineProps<{
  label: string
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg' | null
  tooltip?: string
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | null
}>()
</script>

<template>
  <TooltipProvider v-if="tooltip">
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          class="relative size-9 p-1.5 text-muted-foreground hover:text-foreground"
          :size="size || 'sm'"
          :variant="variant || 'ghost'"
        >
          <slot />
          <span class="sr-only">{{ label }}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent class="text-sm">{{ tooltip }}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
  <Button
    v-else
    class="relative size-9 p-1.5 text-muted-foreground hover:text-foreground"
    :size="size || 'sm'"
    :variant="variant || 'ghost'"
  >
    <slot />
    <span class="sr-only">{{ label }}</span>
  </Button>
</template>
