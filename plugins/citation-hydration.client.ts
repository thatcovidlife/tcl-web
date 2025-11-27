// import { defineNuxtPlugin } from '#app'
import { defineCustomElement } from 'vue'
import TclCitation from '@/components/TclCitation.vue'

export default defineNuxtPlugin(() => {
  // Define TclCitation as a custom element
  const CitationElement = defineCustomElement(TclCitation)

  // Register the custom element
  if (typeof window !== 'undefined' && !customElements.get('tcl-citation')) {
    customElements.define('tcl-citation', CitationElement)
  }
})
