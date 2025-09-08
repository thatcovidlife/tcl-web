import { consola } from 'consola'
import { db } from '@/lib/db'
import { reviews, users, profiles } from '@/lib/db/schema'
import { eq, desc, sql, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { productId, skip } = await readBody(event)

  if (!productId) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Product ID is missing',
    })
  }

  try {
    // Get reviews
    const reviewsData = await db
      .select({
        id: reviews.id,
        content: reviews.content,
        rating: reviews.rating,
        createdAt: reviews.createdAt,
        author: {
          id: users.id,
          email: users.email,
          profileName: profiles.name,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.authorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(eq(reviews.productId, productId), eq(reviews.published, true)))
      .orderBy(desc(reviews.createdAt))
      .limit(5)
      .offset(skip || 0)

    // Get review count
    const [{ count: reviewCount }] = await db
      .select({ count: sql<number>`count(*)::int`.as('count') })
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.published, true)))

    // Get average rating
    const [{ avg: ratingAverage }] = await db
      .select({ avg: sql<number>`avg(rating)::numeric(10,2)`.as('avg') })
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.published, true)))

    consola.info('GET REVIEWS - ', reviewsData)
    consola.info('GET REVIEWS COUNT - ', reviewCount)
    consola.info('GET RATING AVERAGE - ', ratingAverage)

    return {
      entries: reviewsData || [],
      total: reviewCount || 0,
      average: ratingAverage?.toString() || null,
    }
  } catch (e) {
    consola.error(e)
    return { entries: [], total: 0, average: null }
  }
})
