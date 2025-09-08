// @ts-nocheck
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { defineEventHandler, readBody } from 'h3'
import { describe, it, expect } from 'vitest'
import { useApiRoutes } from '../../composables/useApiRoutes'

registerEndpoint(
  '/api/forum/comment/create-comment',
  defineEventHandler(() => ({
    error: null,
  })),
)

registerEndpoint(
  '/api/forum/post/create-post',
  defineEventHandler(() => ({
    error: null,
  })),
)

registerEndpoint(
  '/api/product/reviews/create-review',
  defineEventHandler(async (event) => {
    const { payload } = await readBody(event)

    return {
      id: 1,
      ...payload,
    }
  }),
)

registerEndpoint(
  '/api/forum/user/create-user',
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
  it('should create a comment', async () => {
    const { createComment } = useApiRoutes()
    const call = await createComment(1, { authorId: 2, content: 'lorem ipsum' })
    expect(call).toEqual({ error: null })
  })

  it('should create a post', async () => {
    const { createPost } = useApiRoutes()
    const call = await createPost({
      title: 'lorem ipsum',
      body: 'dolor sit amet',
      category: 'lifrstyle',
    })
    expect(call).toEqual({ error: null })
  })

  it('should create a product review', async () => {
    const { createProductReview } = useApiRoutes()
    const payload = {
      content: 'Great product',
      rating: 4,
      authorId: 2,
      productId: 1,
    }
    const call = await createProductReview(payload)
    expect(call).toEqual({ id: 1, ...payload })
  })

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
