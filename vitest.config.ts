import { defineVitestConfig } from '@nuxt/test-utils/config'
import { resolve } from 'node:path'

export default defineVitestConfig({
  test: {
    dir: 'tests',
    coverage: {
      enabled: true,
      include: [
        'composables/*.ts',
        'pages/**/*.vue',
        'components/*.vue',
        'server/plugins/*.ts',
        'server/middleware/*.ts',
      ],
      reportsDirectory: './coverage',
    },
    globals: true,
  },
})
