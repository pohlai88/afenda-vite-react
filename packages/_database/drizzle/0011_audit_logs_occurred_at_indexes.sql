-- Time-ordered investigation indexes on business `occurred_at` (distinct from append `created_at`).

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_tenant_occurred_at_idx" ON "audit_logs" USING btree ("tenant_id","occurred_at");

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_tenant_actor_occurred_at_idx" ON "audit_logs" USING btree ("tenant_id","actor_user_id","occurred_at");

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_tenant_membership_occurred_at_idx" ON "audit_logs" USING btree ("tenant_id","membership_id","occurred_at");
