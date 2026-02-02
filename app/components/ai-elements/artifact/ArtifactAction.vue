<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { LucideIcon } from 'lucide-vue-next'

defineProps<{
  icon?: LucideIcon
  label?: string
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
  <div class="flex items-center gap-1">
    <TooltipProvider v-if="tooltip">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="size-8 p-0 text-muted-foreground hover:text-foreground"
            :size="size || 'sm'"
            type="button"
            :variant="variant || 'ghost'"
          >
            <slot>
              <template v-if="icon">
                <component :is="icon" className="size-4" />
              </template>
            </slot>
            <span className="sr-only">{{ label || tooltip }}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{{ tooltip }}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <Button
      v-else
      className="size-8 p-0 text-muted-foreground hover:text-foreground"
      :size="size || 'sm'"
      type="button"
      :variant="variant || 'ghost'"
    >
      <slot>
        <template v-if="icon">
          <component :is="icon" :size="18" />
        </template>
      </slot>
      <span className="sr-only">{{ label || tooltip }}</span>
    </Button>
  </div>
</template>
