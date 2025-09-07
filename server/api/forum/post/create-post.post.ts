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
    const { title, content, category, authorId } = payload

    await prisma.post.create({
      data: {
        title,
        content,
        authorId,
        categories: {
          connect: [{ id: category }],
        },
      },
    })

    return { error: null }
  } catch (e) {
    consola.error(e)
    throw createError({
      status: 500,
      message: 'Something went wrong',
      statusMessage: 'Unable to create post',
    })
  }
})
