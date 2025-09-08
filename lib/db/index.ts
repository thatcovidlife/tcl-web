import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DZL_DATABASE_URL!

// Create a connection pool
const client = postgres(connectionString, { prepare: false })

// Create a database instance
export const db = drizzle(client, { schema })

// Export schema for type safety
export * from './schema'
