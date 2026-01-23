CREATE TABLE "shared_chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"chat_id" uuid NOT NULL,
	"slug" varchar(255) NOT NULL,
	"expires_at" timestamp,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_by" uuid NOT NULL,
	CONSTRAINT "shared_chat_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "shared_chat" ADD CONSTRAINT "shared_chat_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_chat" ADD CONSTRAINT "shared_chat_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_chat" ADD CONSTRAINT "shared_chat_chat_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_chat" ADD CONSTRAINT "shared_chat_user_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;