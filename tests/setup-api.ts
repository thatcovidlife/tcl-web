/**
 * Shared Nuxt Setup for API Tests
 *
 * This file sets up the Nuxt test environment ONCE for all API tests.
 * Individual test files should NOT call setup() themselves.
 *
 * Usage: Add this file to vitest.config.ts setupFiles
 */

import { setup } from '@nuxt/test-utils'

// Set up Nuxt test environment once globally
export async function setupNuxt() {
  await setup({
    server: true,
    dev: false,
    // Build once, reuse across all API tests
  })
}
