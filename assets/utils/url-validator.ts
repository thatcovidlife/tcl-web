import { URL_REGEX } from '../constants/url-validation-regex'

export const urlValidator = (v: string) => {
  if (!v.length) {
    return true
  }

  return URL_REGEX.test(v)
}
