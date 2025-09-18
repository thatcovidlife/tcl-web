import { consola } from 'consola'
import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import * as Sentry from '@sentry/nuxt'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const { username } = await readBody(event)

  if (!username) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Username is missing',
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
    const [user] = await Sentry.startSpan(
      {
        name: 'find username',
        op: 'database.query',
      },
      async () => {
        return await db
          .select({
            profileName: profiles.name,
          })
          .from(users)
          .leftJoin(profiles, eq(users.id, profiles.userId))
          .where(eq(profiles.name, username))
          .limit(1)
      },
    )

    consola.info('FIND USERNAME - ', user)

    return user?.profileName ? false : true
  } catch (e) {
    consola.error(e)
    Sentry.captureException(e)
    return false
  }
})
