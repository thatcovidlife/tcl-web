<script setup lang="ts">
import { cn } from '@/app/utils'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAttrs } from 'vue'

import { provideConversationContext } from './conversation-context'

const props = withDefaults(
  defineProps<{
    class?: string
    initialBehavior?: ScrollBehavior
    resizeBehavior?: ScrollBehavior
    stickToBottomOffset?: number
  }>(),
  {
    class: undefined,
    initialBehavior: 'smooth',
    resizeBehavior: 'smooth',
    stickToBottomOffset: 32,
  },
)

const attrs = useAttrs()
const containerRef = ref<HTMLDivElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const isAtBottom = ref(true)
let contentResizeObserver: ResizeObserver | null = null
let containerResizeObserver: ResizeObserver | null = null

function schedule(fn: () => void) {
  if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
    window.requestAnimationFrame(fn)
  } else {
    fn()
  }
}

function updateIsAtBottom() {
  const el = containerRef.value
  if (!el) return
  const distance = el.scrollHeight - el.scrollTop - el.clientHeight
  isAtBottom.value = distance <= props.stickToBottomOffset
}

function scrollToBottom(options?: ScrollToOptions) {
  const el = containerRef.value
  if (!el) return
  el.scrollTo({
    top: el.scrollHeight,
    behavior: options?.behavior ?? props.resizeBehavior,
  })
  isAtBottom.value = true
}

function handleResize() {
  const shouldStick = isAtBottom.value
  schedule(() => {
    if (shouldStick) {
      scrollToBottom()
    }
    updateIsAtBottom()
  })
}

function registerContent(element: HTMLElement | null) {
  if (contentResizeObserver && contentRef.value) {
    contentResizeObserver.unobserve(contentRef.value)
  }
  contentRef.value = element
  if (!element || typeof window === 'undefined') {
    return
  }
  if (!contentResizeObserver) {
    contentResizeObserver = new ResizeObserver(handleResize)
  }
  contentResizeObserver.observe(element)
  handleResize()
}

function handleScroll() {
  updateIsAtBottom()
}

const forwardedAttrs = computed(() => {
  const current = attrs as Record<string, unknown>
  return {
    ...current,
    role: (current.role as string | undefined) ?? 'log',
  }
})

onMounted(async () => {
  const el = containerRef.value
  if (!el) return

  el.addEventListener('scroll', handleScroll, { passive: true })

  if (typeof window !== 'undefined' && !containerResizeObserver) {
    containerResizeObserver = new ResizeObserver(handleResize)
    containerResizeObserver.observe(el)
  }

  await nextTick()
  scrollToBottom({ behavior: props.initialBehavior })
  updateIsAtBottom()
})

onBeforeUnmount(() => {
  const el = containerRef.value
  if (el) {
    el.removeEventListener('scroll', handleScroll)
  }
  contentResizeObserver?.disconnect()
  containerResizeObserver?.disconnect()
  contentResizeObserver = null
  containerResizeObserver = null
})

provideConversationContext({
  isAtBottom,
  scrollToBottom,
  registerContent,
})
</script>

<template>
  <div
    ref="containerRef"
    v-bind="forwardedAttrs"
    :class="cn('relative flex-1 overflow-y-auto', props.class)"
  >
    <slot />
  </div>
</template>
