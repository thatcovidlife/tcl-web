import { consola } from 'consola'
import prisma from '@/lib/prisma'

export default defineEventHandler(async () => {
  try {
    const categories = await prisma.category
      .findMany({
        cacheStrategy: {
          ttl: 3600,
          tags: ['get_categories'],
        },
      })
      .withAccelerateInfo()

    consola.info('GET CATEGORIES - ', categories.info)

    return categories.data || []
  } catch (e) {
    consola.error(e)
    return null
  }
})
