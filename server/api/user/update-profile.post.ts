import { consola } from 'consola'
import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { captureException } from '@sentry/nuxt'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const { data, profileId } = await readBody(event)

  if (!profileId || !data) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Profile data is missing',
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
    const [profile] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .leftJoin(users, eq(profiles.userId, users.id))
      .where(eq(users.email, user.email))
      .limit(1)

    if (!profile || profile.id !== profileId) {
      throw createError({
        status: 403,
        message: 'Unauthorized',
        statusMessage: 'You are not authorized to access this resource',
      })
    }

    const [update] = await db
      .update(profiles)
      .set(data)
      .where(eq(profiles.id, profileId))
      .returning()

    // invalidate get user cache on profile update
    // await db.$invalidate({
    //   tags: ["get_user"],
    // })

    return update
  } catch (e) {
    consola.error(e)
    captureException(e)
    return null
  }
})
