import { sha256 } from 'crypto-hash'

export const getGravatarUrl = async (email: string, size = 200) => {
  const hash = await sha256(email.trim().toLowerCase())
  return `https://gravatar.com/avatar/${hash}?s=${size}`
}
