import { consola } from 'consola'
import prisma from '@/lib/prisma'

export default defineEventHandler(async () => {
  try {
    const posts = await prisma.post
      .findMany({
        where: {
          published: true, // only get published posts
        },
        omit: {
          authorId: true,
          published: true,
        },
        take: 3,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: {
            omit: {
              role: true,
            },
            include: {
              profile: {
                omit: {
                  bio: true,
                  website: true,
                  id: true,
                  userId: true,
                },
              },
            },
          },
          categories: true,
        },
        cacheStrategy: {
          ttl: 60,
          swr: 5,
          tags: ['get_latest_posts'],
        },
      })
      .withAccelerateInfo()

    consola.info('GET LATEST POSTS - ', posts.info)

    return posts.data || []
  } catch (e) {
    consola.error(e)
    return null
  }
})
