import { consola } from 'consola'
import { db } from '@/lib/db'
import { posts, users } from '@/lib/db/schema'
import { eq, inArray, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const { authorId, posts: postIds } = await readBody(event)

  if (!postIds || !authorId) {
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
    const matches = await db
      .select({
        id: posts.id,
        authorId: posts.authorId,
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(
        and(
          inArray(posts.id, postIds.map(Number)),
          eq(users.email, user.email),
        ),
      )

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

    await db
      .update(posts)
      .set({ published: false })
      .where(
        inArray(
          posts.id,
          matches.map(({ id }) => id),
        ),
      )

    return true
  } catch (e) {
    consola.error(e)
    return false
  }
})
