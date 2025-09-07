import { consola } from 'consola'
import prisma from '@/lib/prisma'

export default defineEventHandler(async (event) => {
  const { query, skip } = await readBody(event)

  try {
    const posts = await prisma.post
      .findMany({
        where: {
          AND: {
            published: true,
            OR: [
              {
                title: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                content: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
        omit: {
          // authorId: true,
          published: true,
        },
        // take: 5,
        skip,
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
          tags: ['search_posts'],
        },
      })
      .withAccelerateInfo()

    consola.info('SEARCH POSTS - ', posts.info)

    return { entries: posts.data || [], total: posts.data?.length || 0 }
  } catch (e) {
    consola.error(e)
    return { entries: [], total: 0 }
  }
})
