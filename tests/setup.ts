import { vi } from 'vitest'
import { setup } from '@nuxt/test-utils'

/**
 * Global test configuration file
 * This runs before all test suites
 */

// Set global test timeouts
vi.setConfig({
  testTimeout: 15000,
  hookTimeout: 20000,
})

// Mock environment variables for testing
process.env.DEEPINFRA_API_KEY = 'test-api-key'
process.env.DEEPINFRA_BASE_URL = 'https://api.test.deepinfra.com'
process.env.DEEPINFRA_LLM_MAX_TOKENS = '4000'
process.env.DEEPINFRA_LLM_TEMPERATURE = '0.7'
process.env.QDRANT_URL = 'https://test.qdrant.io'
process.env.QDRANT_KEY = 'test-qdrant-key'
process.env.QDRANT_COLLECTION = 'test-collection'
process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token'
process.env.RATE_LIMIT_MAX_REQUESTS = '100'
process.env.RATE_LIMIT_WINDOW = '60s'
process.env.SANITY_DATASET = 'test-dataset'
process.env.SANITY_PROJECTID = 'test-project-id'
process.env.SANITY_TOKEN = 'test-token'
process.env.PANGEA_TOKEN = 'test-pangea-token'
process.env.PANGEA_DOMAIN = 'test.pangea.cloud'
process.env.NUXT_PUBLIC_SITE_URL = 'http://localhost:3000'

// Set up Nuxt ONCE for all API tests
// This is expensive, so we do it globally rather than per test file
let nuxtSetupDone = false

export async function setupNuxtTests() {
  if (nuxtSetupDone) return

  await setup({
    server: true,
    dev: false,
  })

  nuxtSetupDone = true
}

// Automatically set up Nuxt for API tests
setupNuxtTests()
