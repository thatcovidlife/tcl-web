import { PROTECTED_PAGES } from '../assets/constants/protected-pages'

export default defineNuxtRouteMiddleware(({ name, params }) => {
  const { user } = useUserSession()
  // @ts-ignore
  const [pageName] = name?.split('___')

  if (
    !user.value &&
    (PROTECTED_PAGES.includes(pageName) || params?.type?.includes('directory'))
  ) {
    return navigateTo('/auth/auth0', { external: true, redirectCode: 403 })
  }
})
