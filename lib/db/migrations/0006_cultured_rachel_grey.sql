DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_type t
		JOIN pg_namespace n ON n.oid = t.typnamespace
		WHERE t.typname = 'bookmark_type'
			AND n.nspname = 'public'
	) THEN
		CREATE TYPE "public"."bookmark_type" AS ENUM('blog', 'chat', 'covidnet', 'directory', 'event', 'product', 'resource', 'scientific-library', 'video');
	END IF;
END $$;--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_class c
		JOIN pg_namespace n ON n.oid = c.relnamespace
		WHERE c.relname = 'bookmark'
			AND n.nspname = 'public'
	) THEN
		CREATE TABLE "bookmark" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "bookmark_type" NOT NULL,
	"identifier" text NOT NULL
		);
	END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'bookmark_user_id_user_id_fk'
	) THEN
		ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END $$;--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'bookmark_user_fkey'
	) THEN
		ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bookmark_user_id" ON "bookmark" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bookmark_user_created" ON "bookmark" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bookmark_user_type" ON "bookmark" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bookmark_user_type_created" ON "bookmark" USING btree ("user_id","type","created_at" DESC NULLS LAST);