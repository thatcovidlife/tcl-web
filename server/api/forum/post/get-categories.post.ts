import { consola } from 'consola'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
// import { eq } from 'drizzle-orm'

export default defineEventHandler(async () => {
  try {
    const categoriesData = await db
      .select({
        id: categories.id,
        name: categories.name,
      })
      .from(categories)

    consola.info('GET CATEGORIES - ', categoriesData)

    return categoriesData || []
  } catch (e) {
    consola.error(e)
    return null
  }
})
