// @ts-nocheck
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { defineEventHandler, readBody } from 'h3'
import { describe, it, expect } from 'vitest'
import { useApiRoutes } from '../../composables/useApiRoutes'

const mockUser = registerEndpoint(
  '/api/user/create-user',
  defineEventHandler(async (event) => {
    const { email } = await readBody(event)

    return {
      id: crypto.randomUUID(),
      email,
      role: 'USER',
      profile: null,
    }
  }),
)

describe('Composables > useApiRoutes', () => {
  it('should create a user', async () => {
    const { createUser } = useApiRoutes()
    const email = 'johndoe@thatcovid.life'
    const call = await createUser(email)

    expect(call).toBeDefined()
    expect(call.email).toBe(email)
    expect(call.id).toBeDefined()
    expect(call.role).toBe('USER')
    expect(call.profile).toBeNull()
  })
})
