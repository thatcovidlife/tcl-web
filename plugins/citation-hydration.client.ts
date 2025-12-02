import { createApp, h } from 'vue'
import TclCitation from '@/components/TclCitation.vue'

export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window === 'undefined') return

  // Add a global directive to hydrate citations
  nuxtApp.vueApp.directive('hydrate-citations', {
    mounted(el: HTMLElement) {
      hydrateCitations(el)
    },
    updated(el: HTMLElement) {
      hydrateCitations(el)
    },
  })

  function hydrateCitations(container: HTMLElement) {
    const citations = container.querySelectorAll('tcl-citation')
    citations.forEach((citation) => {
      if (citation.getAttribute('data-hydrated')) return

      const id = citation.getAttribute('id') || ''
      citation.setAttribute('data-hydrated', 'true')

      // Create a Vue app for this citation
      const app = createApp({
        render: () => h(TclCitation, { id }),
      })

      // Mount it, replacing the element's content
      const wrapper = document.createElement('span')
      citation.appendChild(wrapper)
      app.mount(wrapper)
    })
  }
})
