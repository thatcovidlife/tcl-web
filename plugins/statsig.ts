import { StatsigClient } from '@statsig/js-client'
import { StatsigSessionReplayPlugin } from '@statsig/session-replay'
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics'
import consola from 'consola'

export default defineNuxtPlugin(async () => {
  if (process.env.NODE_ENV === 'development') {
    consola.info('Setting up Statsig...')
  }

  const config = useRuntimeConfig()

  if (!config.public.statsig.clientKey) {
    consola.warn('Statsig client key not found')
  }

  const myStatsigClient = new StatsigClient(
    config.public.statsig.clientKey,
    { userID: crypto.randomUUID() }, // TODO: fix
    {
      plugins: [
        new StatsigSessionReplayPlugin(),
        new StatsigAutoCapturePlugin(),
      ],
    },
  )

  await myStatsigClient.initializeAsync()

  return {
    provide: {
      statsig: myStatsigClient,
    },
  }
})
