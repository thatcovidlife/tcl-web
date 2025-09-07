import { consola } from 'consola'
import prisma from '@/lib/prisma'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const { authorId, posts } = await readBody(event)

  if (!posts || !authorId) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Post ID is missing',
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
    const matches = await prisma.post.findMany({
      where: {
        id: {
          in: posts,
        },
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

    if (!matches || !matches.length) {
      throw createError({
        status: 404,
        message: 'Not Found',
        statusMessage: 'These posts are not in our database',
      })
    }

    // TODO: see if this is needed
    // if(post.id !== postId || post.author?.id !== authorId) {
    //   throw createError({
    //     status: 403,
    //     message: "Unauthorized",
    //     statusMessage: "You are not authorized to access this resource",
    //   })
    // }

    await prisma.post.updateMany({
      where: {
        id: {
          in: matches.map(({ id }) => id),
        },
      },
      data: {
        published: false, // unpublish the posts
      },
    })

    return true
  } catch (e) {
    consola.error(e)
    return false
  }
})
