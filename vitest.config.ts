import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    dir: 'tests',
    globals: true,
    testTimeout: 15000,
    hookTimeout: 20000,
    setupFiles: ['./tests/setup.ts'],
    environment: 'nuxt',
    coverage: {
      enabled: true,
      provider: 'v8',
      include: [
        'composables/**/*.ts',
        'pages/**/*.vue',
        'components/**/*.vue',
        'server/api/**/*.ts',
        'lib/**/*.ts',
        'middleware/**/*.ts',
        'plugins/**/*.ts',
        'store/**/*.ts',
        'assets/constants/**/*.ts',
      ],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mock-data.ts',
        'dist/',
        '.nuxt/',
        '.output/',
        '.nitro/',
        '.cache/',
      ],
      reportsDirectory: './coverage',
      reporter: ['text', 'json', 'html', 'lcov'],
      // Gradual thresholds - start at 0 to establish baseline
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
      },
      perFile: true,
      ignoreEmptyLines: true,
    },
  },
})
