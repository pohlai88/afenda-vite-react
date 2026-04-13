CREATE TYPE "public"."audit_actor_type" AS ENUM('person', 'service', 'system', 'integration', 'scheduler', 'migration', 'policy_engine', 'ai', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."audit_outcome" AS ENUM('success', 'rejected', 'failed', 'partial');--> statement-breakpoint
CREATE TYPE "public"."audit_source_channel" AS ENUM('ui', 'api', 'workflow', 'job', 'import', 'replay', 'system');--> statement-breakpoint
CREATE TYPE "public"."deployment_environment" AS ENUM('prod', 'staging', 'sandbox', 'dev');--> statement-breakpoint
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_tenant_id_tenants_id_fk";
--> statement-breakpoint
DROP INDEX "audit_logs_entity_idx";--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "legal_entity_id" uuid;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "actor_type" "audit_actor_type" DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "actor_display" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "acting_as_user_id" uuid;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "action_category" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "aggregate_type" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "aggregate_id" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "document_type" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "document_id" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "parent_audit_id" uuid;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "changes" jsonb;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "outcome" "audit_outcome" DEFAULT 'success' NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "error_code" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "source_channel" "audit_source_channel" DEFAULT 'api' NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "request_id" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "trace_id" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "correlation_id" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "causation_id" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "command_id" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "session_id" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "job_id" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "batch_id" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "idempotency_key" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "reason_code" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "reason_text" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "environment" "deployment_environment";--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "doctrine_ref" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "invariant_ref" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "ai_model_version" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "ai_prompt_version" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "retention_class" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "legal_hold" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "occurred_at" timestamp with time zone;--> statement-breakpoint
UPDATE "audit_logs" SET "occurred_at" = "created_at" WHERE "occurred_at" IS NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "occurred_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "occurred_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "effective_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_legal_entity_id_legal_entities_id_fk" FOREIGN KEY ("legal_entity_id") REFERENCES "public"."legal_entities"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_acting_as_user_id_users_id_fk" FOREIGN KEY ("acting_as_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_parent_fk" FOREIGN KEY ("parent_audit_id") REFERENCES "public"."audit_logs"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "audit_logs_subject_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_recorded_idx" ON "audit_logs" USING btree ("action","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_request_idx" ON "audit_logs" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "audit_logs_trace_idx" ON "audit_logs" USING btree ("trace_id");--> statement-breakpoint
CREATE INDEX "audit_logs_correlation_idx" ON "audit_logs" USING btree ("correlation_id");--> statement-breakpoint
CREATE INDEX "audit_logs_parent_idx" ON "audit_logs" USING btree ("parent_audit_id");--> statement-breakpoint
CREATE INDEX "audit_logs_legal_entity_idx" ON "audit_logs" USING btree ("tenant_id","legal_entity_id");