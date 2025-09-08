import { consola } from 'consola'
import { db } from '@/lib/db'
import {
  posts,
  users,
  profiles,
  categories,
  postsCategories,
} from '@/lib/db/schema'
import { eq, desc, or, ilike, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { query, skip } = await readBody(event)

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
      .where(
        and(
          eq(posts.published, true),
          or(
            ilike(posts.title, `%${query}%`),
            ilike(posts.content, `%${query}%`),
          ),
        ),
      )
      .orderBy(desc(posts.createdAt))
      .offset(skip || 0)

    consola.info('SEARCH POSTS - ', postsData)

    return { entries: postsData || [], total: postsData.length || 0 }
  } catch (e) {
    consola.error(e)
    return { entries: [], total: 0 }
  }
})
