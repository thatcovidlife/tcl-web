import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
  integer,
  uuid,
  text,
  pgEnum,
  primaryKey,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

// Enums
export const roleEnum = pgEnum('role', ['USER', 'ADMIN'])

// Tables
export const users = pgTable('user', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: roleEnum('role').default('USER'),
  active: boolean('active').default(true),
})

export const profiles = pgTable('profile', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  bio: text('bio'),
  website: varchar('website', { length: 255 }),
  userId: integer('user_id').notNull().unique(),
})

export const posts = pgTable('post', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  published: boolean('published').default(true),
  authorId: integer('author_id'),
})

export const categories = pgTable('category', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
})

export const comments = pgTable('comment', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
  content: text('content').notNull(),
  postId: integer('post_id').notNull(),
  published: boolean('published').default(true),
  authorId: integer('author_id').notNull(),
})

export const reviews = pgTable('review', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
  content: text('content').notNull(),
  rating: integer('rating').notNull(),
  productId: uuid('product_id')
    .notNull()
    .default(sql`gen_random_uuid()`),
  published: boolean('published').default(true),
  authorId: integer('author_id').notNull(),
})

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  posts: many(posts),
  comments: many(comments),
  reviews: many(reviews),
}))

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  categories: many(postsCategories),
  comments: many(comments),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(postsCategories),
}))

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  author: one(users, {
    fields: [reviews.authorId],
    references: [users.id],
  }),
}))

// Junction table for many-to-many relationship between posts and categories
export const postsCategories = pgTable(
  'post_category',
  {
    postId: integer('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.categoryId] }),
  }),
)

export const postsCategoriesRelations = relations(
  postsCategories,
  ({ one }) => ({
    post: one(posts, {
      fields: [postsCategories.postId],
      references: [posts.id],
    }),
    category: one(categories, {
      fields: [postsCategories.categoryId],
      references: [categories.id],
    }),
  }),
)
