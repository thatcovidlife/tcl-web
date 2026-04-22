import { Ratelimit } from '@upstash/ratelimit'
import type { Duration } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { config } from './config'

let _ratelimit: Ratelimit | null = null

export function getRatelimit(): Ratelimit {
  if (!_ratelimit) {
    _ratelimit = new Ratelimit({
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
  }
  return _ratelimit
}

export const ratelimit = new Proxy({} as Ratelimit, {
  get(_, prop) {
    return (getRatelimit() as Record<string, unknown>)[prop as string]
  },
})
