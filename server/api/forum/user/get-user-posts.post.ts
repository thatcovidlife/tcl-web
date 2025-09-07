import { consola } from 'consola'
import prisma from '@/lib/prisma'

export default defineEventHandler(async (event) => {
  const { email, skip } = await readBody(event)

  if (!email) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Email is missing',
    })
  }

  try {
    const posts = await prisma.post
      .findMany({
        where: {
          author: {
            email: email,
          },
          published: true,
        },
        take: 5,
        skip,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          createdAt: true,
          title: true,
          categories: true,
          author: {
            select: {
              id: true,
              profile: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        cacheStrategy: {
          ttl: 15,
          tags: ['get_user_posts'],
        },
      })
      .withAccelerateInfo()

    consola.info('GET USER POSTS - ', posts.info)

    const postCount = await prisma.post
      .count({
        where: {
          author: {
            email: email,
          },
          published: true,
        },
        cacheStrategy: {
          ttl: 15,
          tags: ['get_user_posts'],
        },
      })
      .withAccelerateInfo()

    consola.info('GET USER POSTS COUNT - ', postCount.info)

    return { entries: posts.data || [], total: postCount.data || 0 }
  } catch (e) {
    consola.error(e)
    return []
  }
})
