import { consola } from 'consola'
import { db } from '@/lib/db'
import { users, reviews } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const { email, productId } = await readBody(event)

  if (!email) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Email is missing',
    })
  }

  if (!productId) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Product ID is missing',
    })
  }

  if (!user || user.email !== email) {
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
      .where(eq(users.email, email))
      .limit(1)

    if (!userInfo) {
      throw new Error('User not found')
    }

    const [review] = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.authorId, userInfo.id),
          eq(reviews.productId, productId),
          eq(reviews.published, true),
        ),
      )

    consola.info('GET USER REVIEW - ', review)

    return review || null
  } catch (e) {
    consola.error(e)
    return null
  }
})
