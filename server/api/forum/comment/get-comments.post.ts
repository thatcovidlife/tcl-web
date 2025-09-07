import { consola } from 'consola'
import prisma from '@/lib/prisma'

export default defineEventHandler(async (event) => {
  const { id, skip } = await readBody(event)

  if (!id) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Post ID is missing',
    })
  }

  console.log('skip', skip)

  try {
    const comments = await prisma.comment
      .findMany({
        where: {
          published: true,
          postId: parseInt(id),
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
        skip,
        omit: {
          authorId: true,
          postId: true,
          published: true,
          updatedAt: true,
        },
        include: {
          author: {
            omit: {
              email: true,
              role: true,
            },
            include: {
              profile: {
                omit: {
                  id: true,
                  bio: true,
                  userId: true,
                  website: true,
                },
              },
            },
          },
        },
        cacheStrategy: {
          ttl: 30,
          tags: ['get_comments'],
        },
      })
      .withAccelerateInfo()

    consola.info('GET COMMENTS - ', comments.info)

    const commentsCount = await prisma.comment
      .count({
        where: {
          published: true,
          postId: parseInt(id),
        },
        cacheStrategy: {
          ttl: 30,
          tags: ['get_comments'],
        },
      })
      .withAccelerateInfo()

    consola.info('GET COMMENTS COUNT - ', commentsCount.info)

    return { entries: comments.data || [], total: commentsCount.data || 0 }
  } catch (e) {
    consola.error(e)
    return { entries: [], total: 0 }
  }
})
