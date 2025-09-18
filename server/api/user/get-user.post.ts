import { consola } from 'consola'
import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { captureException } from '@sentry/nuxt'

export default defineEventHandler(async (event) => {
  // const { user } = await getUserSession(event)
  const { email } = await readBody(event)

  if (!email) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'Email is missing',
    })
  }

  // TODO: see if this is needed?
  // if(!user || user.email !== email) {
  //   throw createError({
  //     status: 403,
  //     message: "Unauthorized",
  //     statusMessage: "You are not authorized to access this resource",
  //   })
  // }

  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        active: users.active,
        profile: {
          id: profiles.id,
          name: profiles.name,
          bio: profiles.bio,
          website: profiles.website,
          userId: profiles.userId,
          language: profiles.language,
          theme: profiles.theme,
        },
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.email, email))

    consola.info('GET USER - ', user)

    return user || null
  } catch (e) {
    consola.error(e)
    captureException(e)
    return null
  }
})
