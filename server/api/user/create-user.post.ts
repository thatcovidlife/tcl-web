import { consola } from 'consola'
import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import * as Sentry from '@sentry/nuxt'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const { email } = await readBody(event)

  if (!email) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Email is missing',
    })
  }

  if (!user || user.email !== email) {
    throw createError({
      status: 403,
      message: 'Unauthorized',
      statusMessage: 'You are not authorized to access this resource',
    })
  }

  try {
    // Create the user
    const [newUser] = await Sentry.startSpan(
      {
        name: 'insert user',
        op: 'database.query',
      },
      async () => {
        return await db
          .insert(users)
          .values({
            email: email,
          })
          .returning()
      },
    )

    // Create an empty profile for the user
    if (newUser) {
      await Sentry.startSpan(
        {
          name: 'insert user profile',
          op: 'database.query',
        },
        async () => {
          return await db.insert(profiles).values({
            userId: newUser.id,
          })
        },
      )
    }

    // Fetch the profile
    const [profile] = await Sentry.startSpan(
      {
        name: 'fetch user profile',
        op: 'database.query',
      },
      async () => {
        return await db
          .select()
          .from(profiles)
          .where(eq(profiles.userId, newUser!.id))
          .limit(1)
      },
    )

    return { ...newUser, profile }
  } catch (e) {
    consola.error(e)
    Sentry.captureException(e)
    return null
  }
})
