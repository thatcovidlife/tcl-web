import consola from 'consola'

export const useApiRoutes = () => {
  const createChat = async (userId: string, title: string) => {
    try {
      const res = await $fetch('/api/chat/create', {
        method: 'POST',
        body: { user_id: userId, title },
      })

      return res || null
    } catch (e) {
      consola.error(e)
      return null
    }
  }

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

  const getUserChats = async (limit: number = 5, offset: number = 0) => {
    try {
      const res = await $fetch('/api/chat/list', {
        method: 'GET',
        query: { limit, offset },
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

  const retrieveChat = async (chatId: string) => {
    try {
      const res = await $fetch('/api/chat/retrieve', {
        method: 'GET',
        query: { id: chatId },
      })

      return res || null
    } catch (e) {
      consola.error(e)
      return null
    }
  }

  const saveMessages = async (
    chatId: string,
    messages: Array<{
      id?: string
      role: string
      content: string
      parts?: any
    }>,
  ) => {
    try {
      const res = await $fetch('/api/chat/save', {
        method: 'POST',
        body: { chat_id: chatId, messages },
      })

      return res || null
    } catch (e) {
      consola.error(e)
      return null
    }
  }

  const searchChats = async (
    search: string,
    page: number = 1,
    pageSize: number = 10,
  ) => {
    try {
      const res = await $fetch('/api/chat/search', {
        method: 'POST',
        body: { search, page, pageSize },
      })

      return res || null
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
    createChat,
    createUser,
    findUsername,
    getOrCreateUser,
    getUser,
    getUserById,
    getUserChats,
    getUsername,
    getUserRole,
    retrieveChat,
    saveMessages,
    searchChats,
    updateUserProfile,
  }
}
