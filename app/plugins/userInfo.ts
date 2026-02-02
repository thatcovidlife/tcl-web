import consola from 'consola'
import { useUserStore } from '@/store/user'

export default defineNuxtPlugin(async () => {
  if (process.env.NODE_ENV === 'development') {
    consola.info('Retrieving user info...')
  }

  const userStore = useUserStore()

  await userStore.updateUserInfo()
})
