import { consola } from 'consola'
import prisma from '@/lib/prisma'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const { username } = await readBody(event)

  if (!username) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Username is missing',
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
    const user = await prisma.user
      .findFirst({
        where: {
          profile: {
            name: username,
          },
        },
        select: {
          profile: {
            select: {
              name: true,
            },
          },
        },
        cacheStrategy: {
          ttl: 15,
          tags: ['find_username'],
        },
      })
      .withAccelerateInfo()

    consola.info('FIND USERNAME - ', user.info)

    return user.data?.profile?.name ? false : true
  } catch (e) {
    consola.error(e)
    return false
  }
})
