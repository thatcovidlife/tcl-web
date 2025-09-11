import { sql } from 'drizzle-orm'
import { pgTable, varchar, boolean, pgEnum, uuid } from 'drizzle-orm/pg-core'
// import { createSchemaFactory } from 'drizzle-zod'
// import { z } from 'zod'

// export const { createInsertSchema, createSelectSchema, createUpdateSchema } =
//   createSchemaFactory({ zodInstance: z })

// Enums
export const roleEnum = pgEnum('role', ['USER', 'ADMIN'])

// Tables
export const users = pgTable('user', {
  id: uuid('id')
    .notNull()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: roleEnum('role').default('USER'),
  active: boolean('active').default(true),
})

export const profiles = pgTable('profile', {
  id: uuid('id')
    .notNull()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: varchar('name', { length: 255 }),
  bio: varchar('bio', { length: 500 }),
  website: varchar('website', { length: 255 }),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
})
