<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { Badge } from '@/components/ui/badge'
import { CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { ToolUIPart } from 'ai'
import {
  CheckCircleIcon,
  ChevronDownIcon,
  CircleIcon,
  ClockIcon,
  WrenchIcon,
  XCircleIcon,
} from 'lucide-vue-next'
import { useTool } from './tool-context'

defineOptions({ inheritAttrs: false, name: 'ToolHeader' })

const props = defineProps<{
  title?: string
  type: ToolUIPart['type']
  state: ToolUIPart['state']
}>()

const attrs = useAttrs()
const { isOpen } = useTool()

type ToolState = ToolUIPart['state']

const STATUS_LABELS: Partial<Record<ToolState, string>> = {
  'input-streaming': 'Pending',
  'input-available': 'Running',
  'output-available': 'Completed',
  'output-error': 'Error',
}

type StatusIconComponent = typeof CircleIcon

const STATUS_ICONS: Partial<Record<ToolState, StatusIconComponent>> = {
  'input-streaming': CircleIcon,
  'input-available': ClockIcon,
  'output-available': CheckCircleIcon,
  'output-error': XCircleIcon,
}

const STATUS_ICON_CLASSES: Partial<Record<ToolState, string>> = {
  'input-streaming': 'size-4',
  'input-available': 'size-4 animate-pulse',
  'output-available': 'size-4 text-green-600',
  'output-error': 'size-4 text-red-600',
}

const headerClasses = computed(() =>
  cn(
    'group flex w-full items-center justify-between gap-4 p-3',
    attrs.class as string | string[] | undefined,
  ),
)

const restAttrs = computed(() => {
  const { class: _class, ...rest } = attrs as Record<string, unknown>
  return rest
})

const displayTitle = computed(() => {
  if (props.title) return props.title
  const [, ...rest] = props.type.split('-')
  return rest.length > 0 ? rest.join('-') : props.type
})

const statusLabel = computed(
  () => STATUS_LABELS[props.state] ?? props.state ?? 'Pending',
)

const StatusIcon = computed(() => STATUS_ICONS[props.state] ?? CircleIcon)

const statusIconClasses = computed(
  () => STATUS_ICON_CLASSES[props.state] ?? 'size-4',
)
</script>

<template>
  <CollapsibleTrigger :class="headerClasses" v-bind="restAttrs">
    <div class="flex items-center gap-2">
      <WrenchIcon class="size-4 text-muted-foreground" />
      <span class="font-medium text-sm">{{ displayTitle }}</span>
      <Badge class="gap-1.5 rounded-full text-xs" variant="secondary">
        <component :is="StatusIcon" :class="statusIconClasses" />
        {{ statusLabel }}
      </Badge>
    </div>
    <ChevronDownIcon
      :class="
        cn(
          'size-4 text-muted-foreground transition-transform',
          isOpen ? 'rotate-180' : 'rotate-0',
        )
      "
    />
  </CollapsibleTrigger>
</template>
