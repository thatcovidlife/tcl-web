CREATE INDEX "idx_bookmark_user_id" ON "bookmark" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_bookmark_user_created" ON "bookmark" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_bookmark_user_type" ON "bookmark" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "idx_bookmark_user_type_created" ON "bookmark" USING btree ("user_id","type","created_at" DESC NULLS LAST);