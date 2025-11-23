import { sql } from 'drizzle-orm'
import {
  foreignKey,
  json,
  pgTable,
  varchar,
  boolean,
  pgEnum,
  uuid,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

// Enums
export const chatRoleEnum = pgEnum('chat_role', ['user', 'assistant'])
export const languageEnum = pgEnum('language', ['en', 'es', 'fr', 'pt'])
export const roleEnum = pgEnum('role', ['USER', 'ADMIN'])
export const themeEnum = pgEnum('theme', ['light', 'dark', 'system'])

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

export const profiles = pgTable(
  'profile',
  {
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
    language: languageEnum('language').default('en'),
    theme: themeEnum('theme').default('system'),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'profile_user_fkey',
    }).onDelete('cascade'),
  ],
)

export const chats = pgTable(
  'chat',
  {
    id: uuid('id')
      .notNull()
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'chat_user_fkey',
    }).onDelete('cascade'),
  ],
)

export const messages = pgTable(
  'message',
  {
    id: uuid('id')
      .notNull()
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
    chatId: uuid('chat_id')
      .notNull()
      .references(() => chats.id, { onDelete: 'cascade' }),
    messageId: varchar('message_id', { length: 255 }).notNull(),
    content: text('content').notNull(),
    role: chatRoleEnum('role').notNull(),
    parts: json('parts')
      .$type<any>()
      .default(sql`'[]'::json`),
  },
  (table) => [
    foreignKey({
      columns: [table.chatId],
      foreignColumns: [chats.id],
      name: 'message_chat_fkey',
    }).onDelete('cascade'),
  ],
)
