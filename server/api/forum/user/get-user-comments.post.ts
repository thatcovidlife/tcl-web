import { consola } from 'consola'
import { db } from '@/lib/db'
import { users, comments, profiles } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event)

  if (!email) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Email is missing',
    })
  }

  try {
    const [user] = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user) {
      throw new Error('User not found')
    }

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
      .where(and(eq(comments.authorId, user.id), eq(comments.published, true)))

    consola.info('GET USER COMMENTS - ', commentsData)

    return commentsData || []
  } catch (e) {
    consola.error(e)
    return []
  }
})
