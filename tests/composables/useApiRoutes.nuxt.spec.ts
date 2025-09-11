// @ts-nocheck
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { defineEventHandler, readBody } from 'h3'
import { describe, it, expect } from 'vitest'
import { useApiRoutes } from '../../composables/useApiRoutes'

registerEndpoint(
  '/api/user/create-user',
  defineEventHandler(async (event) => {
    const { email } = await readBody(event)

    return {
      id: 1,
      email,
      role: 'USER',
      profile: null,
      comments: [],
      posts: [],
      reviews: [],
    }
  }),
)

describe('Composables > useApiRoutes', () => {
  it('should create a user', async () => {
    const { createUser } = useApiRoutes()
    const email = 'johndoe@thatcovid.life'
    const call = await createUser(email)
    expect(call).toEqual({
      id: 1,
      email,
      role: 'USER',
      profile: null,
      comments: [],
      posts: [],
      reviews: [],
    })
  })
})
