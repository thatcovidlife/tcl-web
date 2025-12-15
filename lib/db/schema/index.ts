import { sql } from 'drizzle-orm'
import {
  foreignKey,
  index,
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
export const bookmarkTypeEnum = pgEnum('bookmark_type', [
  'blog',
  'chat',
  'covidnet',
  'directory',
  'event',
  'product',
  'resource',
  'scientific-library',
  'video',
])

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

export const likes = pgTable(
  'like',
  {
    id: uuid('id')
      .notNull()
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
    messageId: uuid('message_id')
      .notNull()
      .references(() => messages.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    like: boolean('like').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.messageId],
      foreignColumns: [messages.id],
      name: 'like_message_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'like_user_fkey',
    }).onDelete('cascade'),
  ],
)

export const bookmarks = pgTable(
  'bookmark',
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
    type: bookmarkTypeEnum('type').notNull(),
    identifier: text('identifier').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'bookmark_user_fkey',
    }).onDelete('cascade'),
    // Indexes for query performance optimization
    index('idx_bookmark_user_id').on(table.userId),
    index('idx_bookmark_user_created').on(table.userId, table.createdAt.desc()),
    index('idx_bookmark_user_type').on(table.userId, table.type),
    index('idx_bookmark_user_type_created').on(
      table.userId,
      table.type,
      table.createdAt.desc(),
    ),
  ],
)
