import { consola } from 'consola'
import prisma from '@/lib/prisma'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const { payload, postId } = await readBody(event)

  if (!payload || !postId) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Email is missing',
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
    const { content, authorId } = payload

    await prisma.comment.create({
      data: {
        content,
        author: {
          connect: { id: authorId },
        },
        post: {
          connect: { id: postId },
        },
      },
    })

    return { error: null }
  } catch (e) {
    consola.error(e)
    throw createError({
      status: 500,
      message: 'Something went wrong',
      statusMessage: 'Unable to create comment',
    })
  }
})
