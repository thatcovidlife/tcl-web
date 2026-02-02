import { useStatsig } from './useStatsig'
import type { MobileNavItem, NavConfig } from '@/lib/types'

export const useNavConfig = () => {
  const { t } = useI18n()
  const { loggedIn } = useUserSession()
  const { statsig } = useStatsig()
  const chatEnabled = computed(
    () => statsig.checkGate('chat_enabled') && loggedIn.value,
  )

  const config = computed(
    () =>
      [
        {
          id: 'latest',
          title: t('topNav.latest.title'),
          display: {
            title: t('topNav.latest.display.title'),
            icon: 'ion:newspaper-outline',
            description: t('topNav.latest.display.description'),
          },
          children: [
            {
              id: 'publications-news',
              title: t('topNav.latest.children.news.title'),
              description: t('topNav.latest.children.news.description'),
              link: '/news?offset=0&limit=5',
            },
            {
              id: 'publications-library',
              title: t('topNav.latest.children.library.title'),
              description: t('topNav.latest.children.library.description'),
              link: '/scientific-library?offset=0&limit=5',
            },
            {
              id: 'publications-videos',
              title: t('topNav.latest.children.videos.title'),
              description: t('topNav.latest.children.videos.description'),
              link: '/video?offset=0&limit=5',
            },
            {
              id: 'publications-phw',
              title: t('topNav.latest.children.phw.title'),
              description: t('topNav.latest.children.phw.description'),
              link: '/public-health?offset=0&limit=5',
            },
            {
              id: 'publications-events',
              title: t('topNav.latest.children.events.title'),
              description: t('topNav.latest.children.events.description'),
              link: '/event?offset=0&limit=5',
            },
          ],
          enabled: true,
        },
        {
          id: 'other',
          title: t('topNav.other.title'),
          children: [
            {
              id: 'other-covidnet',
              title: t('topNav.other.children.covidnet.title'),
              description: t('topNav.other.children.covidnet.description'),
              link: '/covidnet?offset=0&limit=5',
            },
            {
              id: 'other-directory',
              title: t('topNav.other.children.directory.title'),
              description: t('topNav.other.children.directory.description'),
              link: '/directory?offset=0&limit=5',
              premium: true,
            },
            {
              id: 'other-products',
              title: t('topNav.other.children.products.title'),
              description: t('topNav.other.children.products.description'),
              link: '/product?offset=0&limit=5',
            },
            {
              id: 'other-resources',
              title: t('topNav.other.children.resources.title'),
              description: t('topNav.other.children.resources.description'),
              link: '/resource?offset=0&limit=5',
            },
          ],
          enabled: true,
        },
        // {
        //   id: 'forum',
        //   title: t('topNav.forum.title'),
        //   link: '/forum?offset=0&limit=5',
        // },
        {
          id: 'blog',
          title: t('topNav.blog.title'),
          link: '/blog?offset=0&limit=5',
          premium: false,
          enabled: true,
        },
        {
          id: 'chat',
          title: 'Chat',
          link: '/chat',
          premium: true,
          enabled: chatEnabled.value,
        },
      ] as NavConfig[],
  )

  const mobileConfig = computed(
    () =>
      [
        {
          id: 'mobile-home',
          link: '/',
          premium: false,
          title: t('layout.home'),
          enabled: true,
        },
        {
          id: 'mobile-news',
          link: '/news?offset=0&limit=5',
          premium: false,
          title: t('topNav.latest.children.news.title'),
          enabled: true,
        },
        {
          id: 'mobile-library',
          link: '/scientific-library?offset=0&limit=5',
          premium: false,
          title: t('topNav.latest.children.library.title'),
          enabled: true,
        },
        {
          id: 'mobile-videos',
          link: '/video?offset=0&limit=5',
          premium: false,
          title: t('topNav.latest.children.videos.title'),
          enabled: true,
        },
        {
          id: 'mobile-phw',
          title: t('topNav.latest.children.phw.title'),
          link: '/public-health?offset=0&limit=5',
          premium: false,
          enabled: true,
        },
        {
          id: 'mobile-events',
          title: t('topNav.latest.children.events.title'),
          link: '/event?offset=0&limit=5',
          premium: false,
          enabled: true,
        },
        {
          id: 'mobile-covidnet',
          title: t('topNav.other.children.covidnet.title'),
          link: '/covidnet?offset=0&limit=5',
          premium: false,
          enabled: true,
        },
        {
          id: 'mobile-directory',
          title: t('topNav.other.children.directory.title'),
          link: '/directory?offset=0&limit=5',
          premium: true,
          enabled: true,
        },
        {
          id: 'mobile-products',
          title: t('topNav.other.children.products.title'),
          link: '/product?offset=0&limit=5',
          premium: false,
          enabled: true,
        },
        {
          id: 'mobile-resources',
          title: t('topNav.other.children.resources.title'),
          link: '/resource?offset=0&limit=5',
          premium: false,
          enabled: true,
        },
        // {
        //   id: 'forum',
        //   title: t('topNav.forum.title'),
        //   link: '/forum?offset=0&limit=5',
        //   premium: false,
        // },
        {
          id: 'blog',
          title: t('topNav.blog.title'),
          link: '/blog?offset=0&limit=5',
          premium: false,
          enabled: true,
        },
        {
          id: 'chat',
          title: 'Chat',
          link: '/chat',
          premium: true,
          enabled: chatEnabled.value && loggedIn.value,
        },
      ] as MobileNavItem[],
  )

  return { config, mobileConfig }
}
