import { inject, provide, ref, type Ref } from 'vue'
import type { UnwrapRefCarouselApi } from '@/components/ui/carousel/interface'

const CONTEXT_KEY = Symbol('InlineCitationCarouselContext')

export type InlineCitationCarouselContext = {
  api: Ref<UnwrapRefCarouselApi | undefined>
}

export function provideInlineCitationCarousel() {
  const context: InlineCitationCarouselContext = {
    api: ref<UnwrapRefCarouselApi>(),
  }

  provide(CONTEXT_KEY, context)

  return context
}

export function useInlineCitationCarousel() {
  const context = inject<InlineCitationCarouselContext>(CONTEXT_KEY)

  if (!context) {
    throw new Error(
      'InlineCitation components must be used within InlineCitationCarousel',
    )
  }

  return context
}
