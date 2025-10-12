import { COVIDNET_TYPES } from '@/assets/constants/covidnet-types'
import type { FeaturedPost, VideoPost } from '@/lib/types'

export const useCovidnet = () => {
  const videosMapper = (v: Record<string, any>): VideoPost => ({
    id: v['yt:videoId'][0],
    date: v.published[0].split('T')[0],
    description:
      v['media:group'][0]['media:description'][0].substr(0, 255) + '...',
    thumbnail: v['media:group'][0]['media:thumbnail'][0].$.url,
    title: v.title[0],
    url: v.link[0].$.href,
  })

  const getChannelFeed = async (
    channelID: string,
    maxLength = 3,
  ): Promise<VideoPost[]> => {
    try {
      const { data, error } = await useFetch(
        `/api/external/feeds/youtube/${channelID}`,
      )
      if (error.value) throw error.value
      return (data.value?.entry || []).splice(0, maxLength).map(videosMapper)
    } catch (e) {
      console.error(e)
      return []
    }
  }

  const getBlogOg = async (posts: string[]): Promise<FeaturedPost[]> => {
    try {
      const { data, error } = await useFetch('/api/external/feeds/blog/og', {
        method: 'POST',
        body: {
          posts,
        },
      })

      if (error.value) throw error.value

      return data?.value as FeaturedPost[]
    } catch (e) {
      console.error(e)
      return []
    }
  }

  const isFeaturedContentLoading = ref(false)

  const getFeaturedContent = async ({
    blogFeaturedURLs,
    contentType,
    twitterFeaturedPosts,
  }: {
    blogFeaturedURLs: string[]
    contentType: string
    twitterFeaturedPosts: string[]
  }): Promise<FeaturedPost[] | string[] | null> => {
    let content: FeaturedPost[] | string[] | null = []

    switch (contentType) {
      case COVIDNET_TYPES.BLOG:
        isFeaturedContentLoading.value = true
        content = await getBlogOg(blogFeaturedURLs)
        break
      case COVIDNET_TYPES.TWITTER:
        content = twitterFeaturedPosts
        break
    }

    isFeaturedContentLoading.value = false

    return content
  }

  const hasBlogRssURL = ({
    contentType,
    blogRssURL,
  }: {
    contentType: string
    blogRssURL?: string
  }) => contentType === COVIDNET_TYPES.BLOG && blogRssURL

  const hasFeaturedContent = ({
    blogFeaturedURLs,
    twitterFeaturedPosts,
  }: {
    blogFeaturedURLs?: string[]
    twitterFeaturedPosts?: string[]
  }) => blogFeaturedURLs?.length || twitterFeaturedPosts?.length

  return {
    COVIDNET_TYPES,
    getChannelFeed,
    getFeaturedContent,
    hasBlogRssURL,
    hasFeaturedContent,
    isFeaturedContentLoading,
  }
}
