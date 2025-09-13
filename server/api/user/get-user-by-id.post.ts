import { consola } from 'consola'
import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { id } = await readBody(event)

  if (!id) {
    throw createError({
      status: 400,
      message: 'Bad request',
      statusMessage: 'User ID is missing',
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
        },
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.id, id))
      .limit(1)

    consola.info('GET USER BY ID - ', user)

    return user || null
  } catch (e) {
    consola.error(e)
    return null
  }
})
