import type { StatsigClient } from '@statsig/js-client'

export const useStatsig = () => {
  const { $statsig } = useNuxtApp()

  return {
    statsig: $statsig as StatsigClient,
  }
}
