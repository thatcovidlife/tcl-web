import { consola } from 'consola'
import { db } from '@/lib/db'
import { comments, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

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
    const [comment] = await db
      .select({
        id: comments.id,
        authorId: comments.authorId,
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.id, parseInt(commentId)))
      .limit(1)

    if (!comment) {
      throw createError({
        status: 404,
        message: 'Not Found',
        statusMessage: 'This comment is not in our database',
      })
    }

    if (
      comment.id !== parseInt(commentId) ||
      comment.authorId !== parseInt(authorId)
    ) {
      throw createError({
        status: 403,
        message: 'Unauthorized',
        statusMessage: 'You are not authorized to access this resource',
      })
    }

    await db
      .update(comments)
      .set({ published: false })
      .where(eq(comments.id, comment.id))

    return true
  } catch (e) {
    consola.error(e)
    return false
  }
})
