CREATE TYPE "public"."language" AS ENUM('en', 'es', 'fr', 'pt');--> statement-breakpoint
CREATE TYPE "public"."theme" AS ENUM('light', 'dark', 'system');--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "language" "language" DEFAULT 'en';--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "theme" "theme" DEFAULT 'system';