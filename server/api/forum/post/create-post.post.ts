import { consola } from 'consola'
import { db } from '@/lib/db'
import { posts, postsCategories, categories } from '@/lib/db/schema'
// import { eq } from 'drizzle-orm'

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
    const { title, content, category, authorId } = payload

    // Create the post
    const [newPost] = await db
      .insert(posts)
      .values({
        title,
        content,
        authorId,
      })
      .returning()

    // Link the post to the category
    if (category && newPost) {
      await db.insert(postsCategories).values({
        postId: newPost.id,
        categoryId: category,
      })
    }

    return { error: null }
  } catch (e) {
    consola.error(e)
    throw createError({
      status: 500,
      message: 'Something went wrong',
      statusMessage: 'Unable to create post',
    })
  }
})
