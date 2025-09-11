// @ts-nocheck
import { drizzle } from 'drizzle-orm/node-postgres' // swap for mysql/sqlite if needed
import { Client } from 'pg'

import userData from './tcl-users.json' assert { type: 'json' }
import profileData from './tcl-profiles.json' assert { type: 'json' }

import { users, profiles } from '../schema'

const client = new Client({
  connectionString: process.env.DZL_DATABASE_URL,
})
await client.connect()
const db = drizzle(client)

// First, let's delete any existing rows to start fresh
console.log('Clearing existing users data...')
await db.delete(users)

for (let i = 0; i < userData.length; i++) {
  const user = userData[i]
  const profile = profileData?.find((p) => p.userId === user.id)

  console.log(`Inserting user ${i + 1}/${userData.length}: ${user.email}`)

  const userId = crypto.randomUUID()
  const profileId = crypto.randomUUID()

  const userRow: typeof users = {
    id: userId,
    email: user.email,
    role: user.role,
    active: user.active,
  }

  const profileRow: typeof profiles = {
    id: profileId,
    userId: userId,
    bio: profile?.bio || '',
    name: profile?.name || '',
    website: profile?.website || '',
  }

  await db.insert(users).values(userRow).onConflictDoNothing().returning()
  await db.insert(profiles).values(profileRow).onConflictDoNothing().returning()
}

await client.end()
