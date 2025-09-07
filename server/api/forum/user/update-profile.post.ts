import { consola } from 'consola'
import prisma from '@/lib/prisma'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const { data, profileId } = await readBody(event)

  if (!profileId || !data) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Profile data is missing',
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
    const profile = await prisma.profile.findFirstOrThrow({
      where: {
        user: {
          email: user?.email,
        },
      },
    })

    if (!profile || profile.id !== profileId) {
      throw createError({
        status: 403,
        message: 'Unauthorized',
        statusMessage: 'You are not authorized to access this resource',
      })
    }

    const update = await prisma.profile.update({
      where: { id: profileId },
      data,
    })

    // invalidate get user cache on profile update
    // await prisma.$accelerate.invalidate({
    //   tags: ["get_user"],
    // })

    return update
  } catch (e) {
    consola.error(e)
    return null
  }
})
