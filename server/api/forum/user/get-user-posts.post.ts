import { consola } from 'consola'
import { db } from '@/lib/db'
import {
  posts,
  users,
  profiles,
  categories,
  postsCategories,
} from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { email, skip } = await readBody(event)

  if (!email) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Email is missing',
    })
  }

  try {
    // Get user ID
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user) {
      throw new Error('User not found')
    }

    // Get posts
    const postsData = await db
      .select({
        id: posts.id,
        createdAt: posts.createdAt,
        title: posts.title,
        categories: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .leftJoin(postsCategories, eq(posts.id, postsCategories.postId))
      .leftJoin(categories, eq(postsCategories.categoryId, categories.id))
      .where(and(eq(users.email, email), eq(posts.published, true)))
      .limit(5)
      .offset(skip || 0)
      .orderBy(desc(posts.createdAt))

    // Get post count
    const [{ count: postCount }] = await db
      .select({ count: sql`count(*)` })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(and(eq(users.email, email), eq(posts.published, true)))

    consola.info('GET USER POSTS - ', postsData)
    consola.info('GET USER POSTS COUNT - ', postCount)

    return { entries: postsData || [], total: postCount || 0 }
  } catch (e) {
    consola.error(e)
    return { entries: [], total: 0 }
  }
})
