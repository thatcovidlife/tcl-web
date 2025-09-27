export enum ARTICLE_TYPE {
  BLOG = 'blog',
  COVIDNET = 'covidnet',
  DIRECTORY = 'directory',
  EVENT = 'event',
  HEALTH = 'public-health',
  LIBRARY = 'scientific-library',
  NEWS = 'news',
  PRODUCT = 'product',
  RESOURCE = 'resource',
  TAG = 'tag',
  VIDEO = 'video',
}

export type FeaturedPost = {
  date: string | null
  description: string | null
  id: string
  image: {
    type?: string
    url?: string
  } | null
  locale: string | null
  siteName: string | null
  title: string | null
  type: string | null
  url: string | null
}

export type Metadata = {
  aspectRatio: number | null
  height: number | null
  width: number | null
}

export type MobileNavItem = Omit<NavConfigChild, 'description'> & {
  enabled?: boolean
}

export type NavConfigChild = {
  description: string
  id: string
  link: string
  premium?: boolean
  title: string
}

export type NavConfig = {
  children?: NavConfigChild[]
  display?: { description: string; icon?: string; title: string }
  enabled?: boolean
  id: string
  link?: string
  premium?: boolean
  title: string
}

export type Publication = {
  date: Date | string
  description?: string
  end: Date | string | null
  free: boolean
  id: string
  language: string
  limited: boolean
  link: string
  metadata: {
    aspectRatio: number | null
    height: number | null
    width: number | null
  } | null
  onlineOnly: boolean
  premium: boolean
  source: string | null
  tags: Tag[]
  title: string | null
  type: string
  url: string | null
  visual: string | null
}

export type Tag = { label: string; slug: string }

export type Target = '_blank' | '_self'

export type VideoPost = {
  id: string
  date: string
  description: string
  thumbnail: string
  title: string
  url: string
}
