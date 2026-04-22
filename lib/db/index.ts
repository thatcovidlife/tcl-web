import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle> | null = null

function getDb() {
  if (!_db) {
    const rc = useRuntimeConfig()
    const connectionString = rc.dzlDatabaseUrl
    const sql = neon(connectionString)
    _db = drizzle(sql, { schema })
  }
  return _db
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    return (getDb() as Record<string, unknown>)[prop as string]
  },
})

export * from './schema'
