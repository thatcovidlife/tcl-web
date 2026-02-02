import { useStatsig } from './useStatsig'

export const useMobileButtons = () => {
  const { locale } = useI18n()
  const { statsig } = useStatsig()

  const params = statsig.getParameterStore('mobile_urls')

  const ANDROID_URL = params.get('ANDROID_URL') || ''
  const IOS_URL = params.get('IOS_URL') || ''

  const googlePlayBtn = computed(() => `/google-play-badge-${locale.value}.svg`)
  const appleStoreBtn = computed(() => `/apple-store-badge-${locale.value}.svg`)

  return {
    ANDROID_URL,
    IOS_URL,
    appleStoreBtn,
    googlePlayBtn,
  }
}
