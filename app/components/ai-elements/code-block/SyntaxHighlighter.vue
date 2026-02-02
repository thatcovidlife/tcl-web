<script setup lang="ts">
import { h, computed, type VNode } from 'vue'
import { refractor } from 'refractor'
import 'prism-themes/themes/prism-vsc-dark-plus.css'

const props = defineProps<{
  code: string
  language: string
  showLineNumbers?: boolean
}>()

// Parse code to AST when code/language change
const tree = computed(() => {
  try {
    return refractor.highlight(props.code.trim(), props.language)
  } catch {
    return refractor.highlight(props.code.trim(), 'text')
  }
})
// Recursive renderer
function renderNodes(nodes: any[]): VNode[] {
  return nodes.map((node, index) => {
    if (node.type === 'text') {
      return node.value
    }

    if (node.type === 'element') {
      const className = (node.properties.className || []).join(' ')
      return h('span', { class: className }, renderNodes(node.children || []))
    }

    return null
  })
}
</script>

<template>
  <pre class="bg-zinc-800 p-4 flex items-center">
<div v-if="showLineNumbers" class="text-right pr-4 opacity-50 select-none text-[13px] leading-5 flex flex-col items-center text-gray-300">
  <div v-for="n in code.split('\n').length" :key="n">{{ n }}</div>
</div>
<code :class="`language-${language}`" class="!leading-5 overflow-x-auto"><component :is="{ render: () => renderNodes(tree.children) }" /></code>
</pre>
</template>
