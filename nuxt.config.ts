// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/tcl-logo-big-transparent.ico',
        },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: 'anonymous',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Oswald:wght@200..700&family=PT+Serif:ital,wght@0,400;0,700;1,400;1,700&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://s3.amazonaws.com/assets.freshdesk.com/widget/freshwidget.css',
        },
      ],
      script: [
        {
          src: 'https://s3.amazonaws.com/assets.freshdesk.com/widget/freshwidget.js',
          type: 'text/javascript',
        },
      ],
    },
  },

  colorMode: {
    classSuffix: '',
  },

  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  i18n: {
    baseUrl: `${process.env.NUXT_PUBLIC_SITE_URL}/`,
    defaultLocale: 'en',
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        name: 'English',
        file: 'en.ts',
      },
      {
        code: 'es',
        iso: 'es-MX',
        name: 'Español',
        file: 'es.ts',
      },
      {
        code: 'fr',
        iso: 'fr-FR',
        name: 'Français',
        file: 'fr.ts',
      },
      {
        code: 'pt',
        iso: 'pt-BR',
        name: 'Português',
        file: 'pt.ts',
      },
    ],
  },

  linkChecker: {
    enabled: false,
  },

  llms: {
    domain: process.env.NUXT_PUBLIC_SITE_URL,
    title: 'That Covid Life',
    description:
      'This app serves as an educational tool that gathers links to news, research, and other resources relative to COVID-19.',
    sections: [
      {
        title: 'Latest',
        description: 'A curated list of news, scientific papers and events.',
        links: [
          {
            title: 'News',
            description: 'The latest news about COVID-19.',
            href: '/news',
          },
          {
            title: 'Scientific Library',
            description:
              'The latest research and scientific papers on COVID-19.',
            href: '/library',
          },
          {
            title: 'Videos',
            description: 'The latest videos about COVID-19.',
            href: '/video',
          },
          {
            title: 'Events',
            description: 'Upcoming and past events around COVID-19.',
            href: '/event',
          },
          {
            title: 'Public Health Watch',
            description:
              'The latest news on emerging pandemics, such as Mpox and H5N1.',
            href: '/public-health',
          },
        ],
      },
      {
        title: 'Other',
        links: [
          {
            title: 'Covidnet',
            description:
              'A curated list of blogs and youtube channels about COVID-19.',
            href: '/covidnet',
          },
          {
            title: 'Directory',
            description:
              'A directory of covid-conscious businesses and healthcare providers.',
            href: '/directory',
          },
          {
            title: 'PPE',
            description:
              'A list of personal protective equipments, such as masks, air purifiers, etc...',
            href: '/product',
          },
          {
            title: 'Resources',
            description: 'A list of useful resources around COVID-19.',
            href: '/resource',
          },
        ],
      },
    ],
  },

  modules: [
    '@formkit/auto-animate/nuxt',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/test-utils/module',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    '@nuxtjs/leaflet',
    '@nuxtjs/sanity',
    '@nuxtjs/seo',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/turnstile',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'motion-v/nuxt',
    'nuxt-auth-utils',
    'nuxt-llms',
    'nuxt-security',
    'shadcn-nuxt',
    '@sentry/nuxt/module',
  ],

  ogImage: {
    enabled: false,
  },

  pinia: {
    storesDirs: ['./store/**'],
  },

  robots: {
    disallow: [
      '/user/account',
      '/user/bookmarks',
      '/forum/create',
      '/forum/my-posts',
    ],
  },

  runtimeConfig: {
    public: {
      flagsmith: {
        environmentId: process.env.FLAGSMITH_ENVIRONMENT_ID,
      },
      statsig: {
        clientKey: process.env.STATSIG_CLIENT_ID,
      },
    },
    turnstile: {
      secretKey: process.env.TURNSTILE_SECRET_KEY,
    },
  },

  sanity: {
    apiVersion: '2025-03-19',
    dataset: process.env.SANITY_DATASET,
    minimal: true,
    projectId: process.env.SANITY_PROJECTID,
    token: process.env.SANITY_TOKEN,
    useCdn: true,
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'That Covid Life',
      url: 'https://thatcovid.life',
      logo: 'https://thatcovid.life/tcl-icon.png',
    },
  },

  security: {
    headers: {
      contentSecurityPolicy: {
        'img-src': [
          "'self'",
          'data:',
          'blob:',
          'cdn.sanity.io',
          'a.tile.openstreetmap.org',
          'b.tile.openstreetmap.org',
          'c.tile.openstreetmap.org',
          'gravatar.com',
          '*.ytimg.com',
          'prodregistryv2.org',
        ],
      },
      crossOriginEmbedderPolicy: 'unsafe-none',
    },
  },

  sentry: {
    sourceMapsUploadOptions: {
      org: 'that-covid-life-j1',
      project: 'javascript-nuxt',
    },

    autoInjectServerSentry: 'top-level-import',
  },

  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL,
    name: 'That Covid Life',
    description:
      'That Covid Life serves as an educational tool that gathers links to news, research, and other resources relative to COVID-19.',
  },

  sitemap: {
    sitemaps: {
      'en-US': {
        sources: ['/api/__sitemap__/urls'],
      },
      'es-MX': {
        sources: ['/api/__sitemap__/urls?locale=es'],
      },
      'fr-FR': {
        sources: ['/api/__sitemap__/urls?locale=fr'],
      },
      'pt-BR': {
        sources: ['/api/__sitemap__/urls?locale=pt'],
      },
    },
  },

  sourcemap: {
    client: 'hidden',
  },

  tailwindcss: {
    viewer: false,
  },

  turnstile: {
    siteKey: process.env.TURNSTILE_SITE_KEY,
  },

  vite: {
    build: {
      rollupOptions: {
        external: [
          'react',
          'react/jsx-runtime',
          'react-dom/client',
          'react-dom',
          'styled-components',
          'react-is',
        ],
      },
    },
    resolve: {
      alias: {
        '.prisma/client/index-browser':
          './node_modules/.prisma/client/index-browser.js',
      },
    },
  },
})
