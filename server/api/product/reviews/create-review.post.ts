import { consola } from 'consola'
import { db } from '@/lib/db'
import { users, reviews } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

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
    // Get the user ID from the email
    const [userInfo] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1)

    // make sure the logged in user can post a review for the user id
    if (!userInfo || userInfo.id !== payload.authorId) {
      throw createError({
        status: 403,
        message: 'Unauthorized',
        statusMessage: 'You are not authorized to access this resource',
      })
    }

    // Create the review
    const [newReview] = await db.insert(reviews).values(payload).returning()

    return newReview
  } catch (e) {
    consola.error(e)
    throw e
  }
})
