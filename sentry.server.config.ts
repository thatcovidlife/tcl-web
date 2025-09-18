import * as Sentry from '@sentry/nuxt'

Sentry.init({
  dsn: 'https://00e75614f445c95fa0463c8babb3dd7d@o4510037637791744.ingest.us.sentry.io/4510037638840320',

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
})
