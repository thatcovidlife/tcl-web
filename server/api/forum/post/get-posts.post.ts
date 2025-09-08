import { consola } from 'consola'
import { db } from '@/lib/db'
import {
  posts,
  users,
  profiles,
  categories,
  postsCategories,
} from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { skip } = await readBody(event)

  try {
    const postsData = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          email: users.email,
          profileName: profiles.name,
        },
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
      .where(eq(posts.published, true))
      .limit(5)
      .offset(skip || 0)
      .orderBy(desc(posts.createdAt))

    const [{ count: postCount }] = await db
      .select({ count: sql`count(*)` })
      .from(posts)
      .where(eq(posts.published, true))

    consola.info('GET POSTS - ', postsData)
    consola.info('GET POSTS COUNT - ', postCount)

    return { entries: postsData || [], total: postCount || 0 }
  } catch (e) {
    consola.error(e)
    return { entries: [], total: 0 }
  }
})
