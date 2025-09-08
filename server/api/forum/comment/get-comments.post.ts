import { consola } from 'consola'
import { db } from '@/lib/db'
import { comments, users, profiles } from '@/lib/db/schema'
import { eq, desc, and, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { id, skip } = await readBody(event)

  if (!id) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Post ID is missing',
    })
  }

  console.log('skip', skip)

  try {
    const commentsData = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        author: {
          id: users.id,
          email: users.email,
          profileName: profiles.name,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(
        and(eq(comments.postId, parseInt(id)), eq(comments.published, true)),
      )
      .orderBy(desc(comments.createdAt))
      .limit(5)
      .offset(skip || 0)

    const [{ count: commentsCount }] = await db
      .select({ count: sql`count(*)` })
      .from(comments)
      .where(
        and(eq(comments.postId, parseInt(id)), eq(comments.published, true)),
      )

    consola.info('GET COMMENTS - ', commentsData)
    consola.info('GET COMMENTS COUNT - ', commentsCount)

    return { entries: commentsData || [], total: commentsCount || 0 }
  } catch (e) {
    consola.error(e)
    return { entries: [], total: 0 }
  }
})
