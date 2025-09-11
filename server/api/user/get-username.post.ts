import { consola } from 'consola'
import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event)

  if (!email) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Email is missing',
    })
  }

  try {
    const [{ profileName }] = await db
      .select({
        profileName: profiles.name,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.email, email))

    consola.info('GET USERNAME - ', profileName)

    return profileName || null
  } catch (e) {
    consola.error(e)
    return null
  }
})
