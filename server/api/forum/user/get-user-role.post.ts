import { consola } from 'consola'
import prisma from '@/lib/prisma'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const { email } = await readBody(event)

  if (!email) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Email is missing',
    })
  }

  // TODO: see if this is needed?
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
        select: {
          role: true,
        },
        cacheStrategy: {
          ttl: 30,
          tags: ['get_user_role'],
        },
      })
      .withAccelerateInfo()

    consola.info('GET USER ROLE - ', user.info)

    return user.data?.role || null
  } catch (e) {
    consola.error(e)
    return null
  }
})
