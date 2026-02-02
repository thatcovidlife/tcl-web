import { StatsigClient } from '@statsig/js-client'
import { StatsigSessionReplayPlugin } from '@statsig/session-replay'
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics'
import consola from 'consola'

export default defineNuxtPlugin(async () => {
  if (process.env.NODE_ENV === 'development') {
    consola.info('Setting up Statsig...')
  }

  const config = useRuntimeConfig()
  const { user } = useUserSession()
  const userInfo = useUserStore().info || null

  if (!config.public.statsig.clientKey) {
    consola.warn('Statsig client key not found')
  }

  // Get or create stable ID from cookie
  const stableIdCookie = useCookie('user.stable_id', {
    maxAge: 60 * 60 * 24 * 400, // 400 days (browser maximum)
    sameSite: 'lax',
    secure: true,
  })

  if (!stableIdCookie.value) {
    stableIdCookie.value = crypto.randomUUID()
  }

  const myStatsigClient = new StatsigClient(
    config.public.statsig.clientKey,
    {
      userID: userInfo?.id || user.value?.sub || crypto.randomUUID(),
      customIDs: {
        stableID: stableIdCookie.value,
      },
    },
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
