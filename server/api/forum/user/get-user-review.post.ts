import { consola } from 'consola'
import prisma from '@/lib/prisma'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const { email, productId } = await readBody(event)

  if (!email) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Email is missing',
    })
  }

  if (!productId) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Product ID is missing',
    })
  }

  if (!user || user.email !== email) {
    throw createError({
      status: 403,
      message: 'Unauthorized',
      statusMessage: 'You are not authorized to access this resource',
    })
  }

  try {
    const user = await prisma.user
      .findUniqueOrThrow({
        where: {
          email,
        },
        include: {
          reviews: {
            where: {
              productId,
              published: true,
            },
          },
        },
        cacheStrategy: {
          ttl: 30,
          tags: ['get_user_review'],
        },
      })
      .withAccelerateInfo()

    consola.info('GET USER REVIEW - ', user.info)

    return user.data.reviews.length ? user.data.reviews[0] : null
  } catch (e) {
    consola.error(e)
    return null
  }
})
