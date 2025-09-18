import { consola } from 'consola'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { captureException } from '@sentry/nuxt'

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

  // TODO: see if this is needed?
  if (!user || user.email !== email) {
    throw createError({
      status: 403,
      message: 'Unauthorized',
      statusMessage: 'You are not authorized to access this resource',
    })
  }

  try {
    const [{ role }] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.email, email))

    consola.info('GET USER ROLE - ', role)

    return role || null
  } catch (e) {
    consola.error(e)
    captureException(e)
    return null
  }
})
