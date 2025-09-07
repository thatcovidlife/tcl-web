import { consola } from 'consola'
import prisma from '@/lib/prisma'

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event)

  if (!email) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Email is missing',
    })
  }

  try {
    const user = await prisma.user
      .findUniqueOrThrow({
        where: {
          email,
        },
        include: {
          profile: {
            select: {
              name: true,
            },
          },
        },
        cacheStrategy: {
          ttl: 30,
          tags: ['get_username'],
        },
      })
      .withAccelerateInfo()

    consola.info('GET USERNAME - ', user.info)

    return user.data?.profile?.name || null
  } catch (e) {
    consola.error(e)
    return null
  }
})
