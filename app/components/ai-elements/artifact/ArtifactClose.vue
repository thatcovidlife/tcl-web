<script setup lang="ts">
import { XIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

defineProps<{
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg' | null
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
  <Button
    className="size-8 p-0 text-muted-foreground hover:text-foreground"
    :size="size || 'sm'"
    type="button"
    :variant="variant || 'ghost'"
  >
    <slot>
      <XIcon className="size-4" />
    </slot>
    <span className="sr-only">Close</span>
  </Button>
</template>
