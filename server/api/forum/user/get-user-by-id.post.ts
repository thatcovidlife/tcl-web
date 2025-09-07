import { consola } from 'consola'
import prisma from '@/lib/prisma'

export default defineEventHandler(async (event) => {
  const { id } = await readBody(event)

  if (!id) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'User ID is missing',
    })
  }

  // TODO: see if this is needed?
  // if(!user || user.email !== email) {
  //   throw createError({
  //     status: 403,
  //     message: "Unauthorized",
  //     statusMessage: "You are not authorized to access this resource",
  //   })
  // }

  try {
    const user = await prisma.user
      .findFirstOrThrow({
        where: {
          id,
        },
        include: {
          profile: true,
        },
        cacheStrategy: {
          ttl: 60,
          tags: ['get_user_by_id'],
        },
      })
      .withAccelerateInfo()

    consola.info('GET USER BY ID - ', user.info)

    return user.data || null
  } catch (e) {
    consola.error(e)
    return null
  }
})
