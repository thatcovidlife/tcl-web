<script setup lang="ts">
import { toRef } from 'vue'
import { provideCodeBlock } from './code-block-context'
import SyntaxHighlighter from './SyntaxHighlighter.vue'

const props = defineProps<{
  code: string
  language: string
  showLineNumbers?: boolean
}>()

const codeString = toRef(props, 'code')

provideCodeBlock({ code: codeString })
</script>
<template>
  <div
    class="relative w-full overflow-hidden rounded-md border border-foreground/20"
  >
    <div class="relative">
      <SyntaxHighlighter
        :code="code"
        :language="language"
        :showLineNumbers="showLineNumbers"
      />
      <slot />
    </div>
  </div>
</template>
