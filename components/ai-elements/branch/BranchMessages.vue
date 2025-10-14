<script setup lang="ts">
import {
  Comment,
  Fragment,
  Text,
  computed,
  useSlots,
  watch,
  type VNode,
} from 'vue'
import { useBranch } from './branch-context'

const slots = useSlots()

const { currentBranch, branches, setBranches } = useBranch()

const flattenBranches = (nodes: VNode[] = []): VNode[] =>
  nodes.reduce<VNode[]>((acc, node: VNode) => {
    if (node.type === Comment) {
      return acc
    }

    if (node.type === Fragment && Array.isArray(node.children)) {
      acc.push(...flattenBranches(node.children as VNode[]))
      return acc
    }

    if (node.type === Text) {
      const content = typeof node.children === 'string' ? node.children : ''
      if (content.trim().length === 0) {
        return acc
      }
    }

    acc.push(node)
    return acc
  }, [])

const haveSameBranches = (a: VNode[], b: VNode[]) =>
  a.length === b.length && a.every((node, index) => node === b[index])

const normalizedBranches = computed(() =>
  flattenBranches(slots.default?.() ?? []),
)

watch(
  normalizedBranches,
  (newBranches) => {
    if (!haveSameBranches(newBranches, branches.value)) {
      setBranches(newBranches)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="overflow-hidden">
    <component :is="normalizedBranches[currentBranch]" />
  </div>
</template>
