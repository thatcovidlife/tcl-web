import type {
  users,
  profiles,
  posts,
  categories,
  comments,
  reviews,
  postsCategories,
} from './schema'

// Export all table types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert
export type Review = typeof reviews.$inferSelect
export type NewReview = typeof reviews.$inferInsert
export type PostCategory = typeof postsCategories.$inferSelect
export type NewPostCategory = typeof postsCategories.$inferInsert

// Export composite types
export type UserWithProfile = User & { profile?: Profile }
export type PostWithCategories = Post & { categories?: Category[] }
export type CommentWithAuthor = Comment & { author: User }
export type ReviewWithAuthor = Review & { author: User }

// Export utility types for common operations
export type CreatePostData = Omit<NewPost, 'id' | 'createdAt' | 'updatedAt'>
export type CreateCommentData = Omit<
  NewComment,
  'id' | 'createdAt' | 'updatedAt'
>
export type CreateReviewData = Omit<NewReview, 'id' | 'createdAt' | 'updatedAt'>
export type CreateUserData = Omit<NewUser, 'id'>
export type CreateProfileData = Omit<NewProfile, 'id'>
