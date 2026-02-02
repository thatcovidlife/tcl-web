<script setup lang="ts">
import { computed } from 'vue'
import { useContext } from './context-context'
import {
  ICON_CENTER,
  ICON_RADIUS,
  ICON_STROKE_WIDTH,
  ICON_VIEWBOX,
} from './defaults'

const { usedTokens, maxTokens } = useContext()

const circumference = computed(() => 2 * Math.PI * ICON_RADIUS)
const usedPercent = computed(() => usedTokens.value / maxTokens.value)
const dashOffset = computed(() => circumference.value * (1 - usedPercent.value))
</script>
<template>
  <svg
    aria-label="Model context usage"
    :height="20"
    role="img"
    style="color: currentColor"
    :viewBox="`0 0 ${ICON_VIEWBOX} ${ICON_VIEWBOX}`"
    :width="20"
  >
    <circle
      :cx="ICON_CENTER"
      :cy="ICON_CENTER"
      fill="none"
      :opacity="0.25"
      :r="ICON_RADIUS"
      stroke="currentColor"
      :stroke-width="ICON_STROKE_WIDTH"
    />
    <circle
      :cx="ICON_CENTER"
      :cy="ICON_CENTER"
      fill="none"
      :opacity="0.7"
      :r="ICON_RADIUS"
      stroke="currentColor"
      :stroke-dasharray="circumference"
      :stroke-dashoffset="dashOffset"
      stroke-linecap="round"
      :stroke-width="ICON_STROKE_WIDTH"
      :style="{ transformOrigin: 'center', transform: 'rotate(-90deg)' }"
    />
  </svg>
</template>
