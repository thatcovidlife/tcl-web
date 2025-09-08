import { consola } from 'consola'
import { db } from '@/lib/db'
import {
  posts,
  users,
  profiles,
  categories,
  postsCategories,
} from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { id } = await readBody(event)

  if (!id) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Post ID is missing',
    })
  }

  try {
    const [post] = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        published: posts.published,
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
      .where(eq(posts.id, parseInt(id)))

    if (!post || !post.published) {
      throw createError({
        status: 400,
        message: 'Bad request',
        statusMessage: 'Post ID is missing',
      })
    }

    consola.info('GET POST BY ID - ', post)

    return post || null
  } catch (e) {
    consola.error(e)
    throw e
  }
})
