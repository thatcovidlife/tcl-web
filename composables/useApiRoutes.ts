import consola from 'consola'

export const useApiRoutes = () => {
  const createComment = async (postId: number, payload: any) => {
    try {
      return await $fetch('/api/forum/comment/create-comment', {
        method: 'POST',
        body: { payload, postId },
      })
    } catch (e) {
      consola.error(e)
      return { error: e }
    }
  }

  const createPost = async (payload: any) => {
    try {
      return await $fetch('/api/forum/post/create-post', {
        method: 'POST',
        body: { payload },
      })
    } catch (e) {
      consola.error(e)
      return { error: e }
    }
  }

  const createProductReview = async (payload: any) => {
    try {
      return await $fetch('/api/product/reviews/create-review', {
        method: 'POST',
        body: { payload },
      })
    } catch (e) {
      consola.error(e)
      throw e
    }
  }

  const createUser = async (email: string) => {
    try {
      return await $fetch('/api/forum/user/create-user', {
        method: 'POST',
        body: { email },
      })
    } catch (e) {
      consola.error(e)
      return null
    }
  }

  const deleteComment = async (body: {
    authorId: number
    commentId: number
  }) => {
    try {
      return await $fetch('/api/forum/comment/delete-comment', {
        method: 'POST',
        body,
      })
    } catch (e) {
      consola.error(e)
      return false
    }
  }

  const deletePosts = async (body: { authorId: number; posts: number[] }) => {
    try {
      return await $fetch('/api/forum/post/delete-posts', {
        method: 'POST',
        body,
      })
    } catch (e) {
      consola.error(e)
      return false
    }
  }

  const findUsername = async (username: string) => {
    try {
      const available = await $fetch('/api/forum/user/find-username', {
        method: 'POST',
        body: { username },
      })

      return { data: { available }, error: null }
    } catch (e) {
      consola.error(e)
      return { error: e, data: null }
    }
  }

  const getLatestPosts = async () => {
    try {
      const res = await $fetch('/api/forum/post/get-latest-posts', {
        method: 'POST',
      })

      if (!res) {
        throw new Error('No posts found')
      }

      return res || null
    } catch (e) {
      consola.error(e)
      return null
    }
  }

  const getOrCreateUser = async (email: string) => {
    try {
      const user = await getUser(email)
      if (user) return user

      return await createUser(email)
    } catch (e) {
      consola.error(e)
      return null
    }
  }

  const getPostById = async (id: number) => {
    try {
      const res = await $fetch('/api/forum/post/get-post-by-id', {
        method: 'POST',
        body: { id },
      })

      if (!res) {
        throw new Error('Post not found')
      }

      return res || null
    } catch (e) {
      consola.error(e)
      return null
    }
  }

  const getPostComments = async (id: number, skip = 0) => {
    try {
      return await $fetch('/api/forum/comment/get-comments', {
        method: 'POST',
        body: { id, skip },
      })
    } catch (e) {
      consola.error(e)
      return []
    }
  }

  const getPosts = async (skip = 0) => {
    try {
      const res = await $fetch('/api/forum/post/get-posts', {
        method: 'POST',
        body: { skip },
      })

      if (!res) {
        throw new Error('No posts found')
      }

      return res || null
    } catch (e) {
      consola.error(e)
      return null
    }
  }

  const getProductReviews = async (productId: string, skip = 0) => {
    try {
      const res = await $fetch('/api/product/reviews/get-reviews', {
        method: 'POST',
        body: { productId, skip },
      })

      if (!res) {
        throw new Error('No product reviews found')
      }

      return res || []
    } catch (e) {
      consola.error(e)
      return { entries: [], total: 0, average: null }
    }
  }

  const getTopics = async () => {
    try {
      const topics = await $fetch('/api/forum/post/get-categories', {
        method: 'POST',
      })

      return topics || []
    } catch (e) {
      consola.error(e)
      return []
    }
  }

  const getUser = async (email: string) => {
    try {
      const res = await $fetch('/api/forum/user/get-user', {
        method: 'POST',
        body: { email },
      })

      return res || null
    } catch (e) {
      consola.error(e)
      return null
    }
  }

  const getUserById = async (id: number) => {
    try {
      const res = await $fetch('/api/forum/user/get-user-by-id', {
        method: 'POST',
        body: { id },
      })

      return res || null
    } catch (e) {
      consola.error(e)
      return null
    }
  }

  const getUsername = async (email: string) => {
    try {
      const res = await $fetch('/api/forum/user/get-username', {
        method: 'POST',
        body: { email },
      })

      return res
    } catch (e) {
      consola.error(e)
      return null
    }
  }

  const getUserReview = async (email: string, productId: string) => {
    try {
      const res = await $fetch('/api/forum/user/get-user-review', {
        method: 'POST',
        body: { email, productId },
      })

      if (!res) {
        throw new Error('User review not found')
      }

      return res
    } catch (e) {
      consola.error(e)
      return null
    }
  }

  const getUserRole = async (email: string) => {
    try {
      const res = await $fetch('/api/forum/user/get-user-role', {
        method: 'POST',
        body: { email },
      })

      if (!res) {
        throw new Error('User role not found')
      }

      return res
    } catch (e) {
      consola.error(e)
      return null
    }
  }

  const getUserComments = async (email: string) => {
    try {
      const res = await $fetch('/api/forum/user/get-user-comments', {
        method: 'POST',
        body: { email },
      })

      if (!res) {
        throw new Error('User comments not found')
      }

      return res
    } catch (e) {
      consola.error(e)
      return null
    }
  }

  const getUserPosts = async (email: string, skip = 0) => {
    try {
      const res = await $fetch('/api/forum/user/get-user-posts', {
        method: 'POST',
        body: { email, skip },
      })

      if (!res) {
        throw new Error('User posts not found')
      }

      return res
    } catch (e) {
      consola.error(e)
      return null
    }
  }

  const searchPosts = async (query: string, skip = 0) => {
    try {
      return await $fetch('/api/forum/post/search', {
        method: 'POST',
        body: { query, skip },
      })
    } catch (e) {
      consola.error(e)
      return { entries: [], total: 0 }
    }
  }

  const updateProductReview = async (body: {
    payload: any
    reviewId: number
  }) => {
    try {
      return await $fetch('/api/product/reviews/update-review', {
        method: 'POST',
        body,
      })
    } catch (e) {
      consola.error(e)
      throw e
    }
  }

  const updateUserProfile = async (body: { data: any; profileId: number }) => {
    try {
      return await $fetch('/api/forum/user/update-profile', {
        method: 'POST',
        body,
      })
    } catch (e) {
      consola.error(e)
      return null
    }
  }

  return {
    createComment,
    createPost,
    createProductReview,
    createUser,
    deleteComment,
    deletePosts,
    findUsername,
    getLatestPosts,
    getOrCreateUser,
    getPostById,
    getPostComments,
    getPosts,
    getProductReviews,
    getTopics,
    getUser,
    getUserById,
    getUserComments,
    getUsername,
    getUserReview,
    getUserRole,
    getUserPosts,
    searchPosts,
    updateProductReview,
    updateUserProfile,
  }
}
