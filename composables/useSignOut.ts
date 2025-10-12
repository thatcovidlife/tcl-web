export const useSignOut = () => {
  const localePath = useLocalePath()
  const router = useRouter()
  const { clear } = useUserSession()

  const signOut = async () => {
    try {
      await clear()
      router.push(localePath('/'))
    } catch (error) {
      throw error
    }
  }

  return {
    signOut,
  }
}
