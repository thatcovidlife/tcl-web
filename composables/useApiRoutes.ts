import consola from 'consola'

export const useApiRoutes = () => {
  const createUser = async (email: string) => {
    try {
      return await $fetch('/api/user/create-user', {
        method: 'POST',
        body: { email },
      })
    } catch (e) {
      consola.error(e)
      return null
    }
  }

  const findUsername = async (username: string) => {
    try {
      const available = await $fetch('/api/user/find-username', {
        method: 'POST',
        body: { username },
      })

      return { data: { available }, error: null }
    } catch (e) {
      consola.error(e)
      return { error: e, data: null }
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

  const getUser = async (email: string) => {
    try {
      const res = await $fetch('/api/user/get-user', {
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
      const res = await $fetch('/api/user/get-user-by-id', {
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
      const res = await $fetch('/api/user/get-username', {
        method: 'POST',
        body: { email },
      })

      return res
    } catch (e) {
      consola.error(e)
      return null
    }
  }

  const getUserRole = async (email: string) => {
    try {
      const res = await $fetch('/api/user/get-user-role', {
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

  const updateUserProfile = async (body: { data: any; profileId: number }) => {
    return await $fetch('/api/user/update-profile', {
      method: 'POST',
      body,
    })
  }

  return {
    createUser,
    findUsername,
    getOrCreateUser,
    getUser,
    getUserById,
    getUsername,
    getUserRole,
    updateUserProfile,
  }
}
