import type { users, profiles } from './schema'

// Export all table types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert

// Export composite types
export type UserWithProfile = User & { profile?: Profile }

// Export utility types for common operations
export type CreateUserData = Omit<NewUser, 'id'>
export type CreateProfileData = Omit<NewProfile, 'id'>
