import { consola } from 'consola'
import prisma from '@/lib/prisma'

export default defineEventHandler(async (event) => {
  const { id } = await readBody(event)

  if (!id) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Post ID is missing',
    })
  }

  try {
    const post = await prisma.post
      .findUniqueOrThrow({
        where: {
          id: parseInt(id),
        },
        omit: {
          authorId: true,
          updatedAt: true,
        },
        include: {
          author: {
            omit: {
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
          categories: true,
        },
        cacheStrategy: {
          ttl: 180,
          swr: 30,
          tags: ['get_post_by_id'],
        },
      })
      .withAccelerateInfo()

    if (!post || !post.data?.published) {
      throw createError({
        status: 400,
        message: 'Bad request',
        statusMessage: 'Post ID is missing',
      })
    }

    consola.info('GET POST BY ID - ', post.info)

    return post.data || null
  } catch (e) {
    consola.error(e)
    throw e
  }
})
