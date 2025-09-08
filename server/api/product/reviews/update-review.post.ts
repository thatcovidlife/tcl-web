import { consola } from 'consola'
import { db } from '@/lib/db'
import { users, reviews } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const { payload, reviewId } = await readBody(event)

  if (!payload) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Payload is missing',
    })
  }

  if (!reviewId) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'review ID is missing',
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

    const [updatedReview] = await db
      .update(reviews)
      .set(payload)
      .where(eq(reviews.id, parseInt(reviewId)))
      .returning()

    return updatedReview
  } catch (e) {
    consola.error(e)
    throw e
  }
})
