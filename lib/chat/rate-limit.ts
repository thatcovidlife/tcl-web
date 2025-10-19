import { Ratelimit } from '@upstash/ratelimit'
import type { Duration } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { config } from './config'
export const ratelimit = new Ratelimit({
  redis: new Redis({
    url: config.upstashUrl,
    token: config.upstashToken,
  }),
  limiter: Ratelimit.slidingWindow(
    config.rateMaxRequests,
    config.rateWindow as Duration,
  ),
  analytics: true,
  prefix: config.ratePrefix,
})
