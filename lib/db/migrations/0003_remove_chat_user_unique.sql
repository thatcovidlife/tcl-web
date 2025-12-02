-- Drop the unique constraint on chat.user_id to allow users to have multiple chats
ALTER TABLE "chat" DROP CONSTRAINT IF EXISTS "chat_user_id_unique";
