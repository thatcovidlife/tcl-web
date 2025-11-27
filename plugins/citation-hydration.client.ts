// import { defineNuxtPlugin } from '#app'
import { defineCustomElement } from 'vue'
import TclCitationVue from '@/components/TclCitation.vue'

export default defineNuxtPlugin(() => {
  // Define TclCitation as a custom element with styles option
  const CitationElement = defineCustomElement(TclCitationVue, {
    shadowRoot: false, // Disable shadow DOM to allow Tailwind classes
  })

  // Register the custom element
  if (typeof window !== 'undefined' && !customElements.get('tcl-citation')) {
    customElements.define('tcl-citation', CitationElement)
  }
})
