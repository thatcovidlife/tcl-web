import { consola } from 'consola'
import prisma from '@/lib/prisma'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const { authorId, commentId } = await readBody(event)

  if (!commentId || !authorId) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Comment ID is missing',
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
    const comment = await prisma.comment.findUniqueOrThrow({
      where: {
        id: commentId,
        author: {
          email: user.email,
        },
      },
      select: {
        id: true,
        author: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!comment) {
      throw createError({
        status: 404,
        message: 'Not Found',
        statusMessage: 'This comment is not in our database',
      })
    }

    if (comment.id !== commentId || comment.author.id !== authorId) {
      throw createError({
        status: 403,
        message: 'Unauthorized',
        statusMessage: 'You are not authorized to access this resource',
      })
    }

    await prisma.comment.update({
      where: {
        id: comment.id,
      },
      data: {
        published: false, // unpublish the comment
      },
    })

    return true
  } catch (e) {
    consola.error(e)
    return false
  }
})
