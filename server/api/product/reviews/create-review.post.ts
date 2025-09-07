import { consola } from 'consola'
import prisma from '@/lib/prisma'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const { payload } = await readBody(event)

  if (!payload) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Payload is missing',
    })
  }

  if (!user) {
    throw createError({
      status: 403,
      message: 'Unauthorized',
      statusMessage: 'You are not authorized to access this resource',
    })
  }

  try {
    const userInfo = await prisma.user.findUniqueOrThrow({
      select: {
        id: true,
      },
      where: {
        email: user.email,
      },
      cacheStrategy: {
        ttl: 60,
      },
    })

    // make sure the logged in user can post a review for the user id
    if (!userInfo || userInfo.id !== payload.authorId) {
      throw createError({
        status: 403,
        message: 'Unauthorized',
        statusMessage: 'You are not authorized to access this resource',
      })
    }

    return await prisma.review.create({
      data: payload,
    })
  } catch (e) {
    consola.error(e)
    throw e
  }
})
