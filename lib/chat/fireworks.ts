import { createFireworks } from '@ai-sdk/fireworks'

import { config } from './config'

const normalizeFireworksBaseUrl = (baseUrl?: string): string | undefined => {
  if (!baseUrl) {
    return undefined
  }

  const normalized = baseUrl.replace(/\/+$/, '')

  if (normalized.endsWith('/inference/v1')) {
    return normalized
  }

  if (normalized.endsWith('/inference')) {
    return `${normalized}/v1`
  }

  return `${normalized}/inference/v1`
}

export const fireworksBaseUrl =
  normalizeFireworksBaseUrl(config.fireworksBaseUrl) ??
  'https://api.fireworks.ai/inference/v1'

export const fireworksProvider = createFireworks({
  apiKey: config.fireworksApiKey,
  baseURL: fireworksBaseUrl,
})
