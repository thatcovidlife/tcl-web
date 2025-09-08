import { consola } from 'consola'
import { db } from '@/lib/db'
import {
  posts,
  users,
  profiles,
  categories,
  postsCategories,
} from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
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
      .limit(3)
      .orderBy(desc(posts.createdAt))

    consola.info('GET LATEST POSTS - ', postsData)

    return postsData || []
  } catch (e) {
    consola.error(e)
    return null
  }
})
