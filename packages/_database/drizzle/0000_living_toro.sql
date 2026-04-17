CREATE TYPE "public"."auth_challenge_method" AS ENUM('passkey', 'totp', 'email_otp');--> statement-breakpoint
CREATE TYPE "public"."auth_challenge_status" AS ENUM('issued', 'verified', 'consumed', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."audit_actor_type" AS ENUM('person', 'service', 'system', 'integration', 'scheduler', 'migration', 'policy_engine', 'ai', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."audit_outcome" AS ENUM('success', 'rejected', 'failed', 'partial');--> statement-breakpoint
CREATE TYPE "public"."audit_risk_level" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."audit_source_channel" AS ENUM('ui', 'api', 'workflow', 'job', 'import', 'replay', 'system');--> statement-breakpoint
CREATE TYPE "public"."deployment_environment" AS ENUM('production', 'prod', 'staging', 'sandbox', 'dev');--> statement-breakpoint
CREATE TYPE "public"."tenant_membership_status" AS ENUM('invited', 'active', 'suspended', 'left', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."tenant_membership_type" AS ENUM('internal', 'external', 'service');--> statement-breakpoint
CREATE TYPE "public"."tenant_status" AS ENUM('active', 'suspended', 'archived');--> statement-breakpoint
CREATE TABLE "auth_challenges" (
	"id" text PRIMARY KEY NOT NULL,
	"challenge_id" text NOT NULL,
	"subject_user_id" text,
	"subject_email" text NOT NULL,
	"method" "auth_challenge_method" NOT NULL,
	"status" "auth_challenge_status" NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempts_remaining" integer NOT NULL,
	"risk_snapshot" jsonb NOT NULL,
	"device_context_hash" text,
	"issued_at" timestamp with time zone NOT NULL,
	"verified_at" timestamp with time zone,
	"consumed_at" timestamp with time zone,
	"expired_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"legal_entity_id" uuid,
	"membership_id" uuid,
	"auth_user_id" text,
	"actor_type" "audit_actor_type" DEFAULT 'unknown' NOT NULL,
	"actor_user_id" uuid,
	"actor_display" text,
	"acting_as_user_id" uuid,
	"action" text NOT NULL,
	"action_category" text,
	"risk_level" "audit_risk_level" DEFAULT 'low' NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"aggregate_type" text,
	"aggregate_id" text,
	"document_type" text,
	"document_id" text,
	"parent_audit_id" uuid,
	"changes" jsonb,
	"metadata" jsonb,
	"outcome" "audit_outcome" DEFAULT 'success' NOT NULL,
	"error_code" text,
	"source_channel" "audit_source_channel" DEFAULT 'api' NOT NULL,
	"request_id" text,
	"trace_id" text,
	"correlation_id" text,
	"causation_id" text,
	"command_id" text,
	"session_id" text,
	"job_id" text,
	"batch_id" text,
	"idempotency_key" text,
	"reason_code" text,
	"reason_text" text,
	"environment" "deployment_environment" DEFAULT 'production' NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"doctrine_ref" text,
	"invariant_ref" text,
	"resolution_ref" text,
	"ai_model_version" text,
	"ai_prompt_version" text,
	"retention_class" text,
	"legal_hold" boolean DEFAULT false NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "identity_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"afenda_user_id" uuid NOT NULL,
	"auth_provider" text DEFAULT 'better-auth' NOT NULL,
	"better_auth_user_id" text NOT NULL,
	"auth_email" text,
	"is_primary" boolean DEFAULT true NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_subject" text NOT NULL,
	"email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"given_name" text,
	"family_name" text,
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"deactivated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"membership_type" "tenant_membership_type" DEFAULT 'internal' NOT NULL,
	"status" "tenant_membership_status" DEFAULT 'invited' NOT NULL,
	"invited_at" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"joined_at" timestamp with time zone,
	"suspended_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"invited_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_memberships_id_tenant_unique" UNIQUE("id","tenant_id")
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(63) NOT NULL,
	"slug" varchar(63) NOT NULL,
	"name" text NOT NULL,
	"status" "tenant_status" DEFAULT 'active' NOT NULL,
	"base_currency_code" varchar(3) DEFAULT 'USD' NOT NULL,
	"default_locale" varchar(35) DEFAULT 'en' NOT NULL,
	"default_timezone" text DEFAULT 'UTC' NOT NULL,
	"owner_user_id" uuid,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_acting_as_user_id_users_id_fk" FOREIGN KEY ("acting_as_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_parent_fk" FOREIGN KEY ("parent_audit_id") REFERENCES "public"."audit_logs"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_membership_tenant_fk" FOREIGN KEY ("membership_id","tenant_id") REFERENCES "public"."tenant_memberships"("id","tenant_id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "identity_links" ADD CONSTRAINT "identity_links_afenda_user_id_users_id_fk" FOREIGN KEY ("afenda_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_identities" ADD CONSTRAINT "user_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tenant_memberships" ADD CONSTRAINT "tenant_memberships_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tenant_memberships" ADD CONSTRAINT "tenant_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tenant_memberships" ADD CONSTRAINT "tenant_memberships_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_challenges_challenge_id_uidx" ON "auth_challenges" USING btree ("challenge_id");--> statement-breakpoint
CREATE INDEX "auth_challenges_subject_user_id_idx" ON "auth_challenges" USING btree ("subject_user_id");--> statement-breakpoint
CREATE INDEX "auth_challenges_subject_email_idx" ON "auth_challenges" USING btree ("subject_email");--> statement-breakpoint
CREATE INDEX "auth_challenges_status_expires_idx" ON "auth_challenges" USING btree ("status","expires_at");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_created_at_idx" ON "audit_logs" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_occurred_at_idx" ON "audit_logs" USING btree ("tenant_id","occurred_at");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_actor_occurred_at_idx" ON "audit_logs" USING btree ("tenant_id","actor_user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_membership_occurred_at_idx" ON "audit_logs" USING btree ("tenant_id","membership_id","occurred_at");--> statement-breakpoint
CREATE INDEX "audit_logs_subject_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_subject_recorded_idx" ON "audit_logs" USING btree ("tenant_id","entity_type","entity_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_user_idx" ON "audit_logs" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_recorded_idx" ON "audit_logs" USING btree ("action","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_request_idx" ON "audit_logs" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "audit_logs_trace_idx" ON "audit_logs" USING btree ("trace_id");--> statement-breakpoint
CREATE INDEX "audit_logs_correlation_idx" ON "audit_logs" USING btree ("correlation_id");--> statement-breakpoint
CREATE INDEX "audit_logs_parent_idx" ON "audit_logs" USING btree ("parent_audit_id");--> statement-breakpoint
CREATE INDEX "audit_logs_legal_entity_idx" ON "audit_logs" USING btree ("tenant_id","legal_entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_membership_idx" ON "audit_logs" USING btree ("membership_id");--> statement-breakpoint
CREATE INDEX "audit_logs_risk_recorded_idx" ON "audit_logs" USING btree ("risk_level","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_outcome_recorded_idx" ON "audit_logs" USING btree ("outcome","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_causation_idx" ON "audit_logs" USING btree ("causation_id");--> statement-breakpoint
CREATE INDEX "audit_logs_command_idx" ON "audit_logs" USING btree ("command_id");--> statement-breakpoint
CREATE INDEX "audit_logs_batch_idx" ON "audit_logs" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "audit_logs_job_idx" ON "audit_logs" USING btree ("job_id");--> statement-breakpoint
CREATE UNIQUE INDEX "identity_links_provider_ba_user_unique" ON "identity_links" USING btree ("auth_provider","better_auth_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "identity_links_one_primary_per_provider" ON "identity_links" USING btree ("afenda_user_id","auth_provider") WHERE "identity_links"."is_primary" = true;--> statement-breakpoint
CREATE INDEX "identity_links_afenda_user_idx" ON "identity_links" USING btree ("afenda_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_identities_provider_subject_unique" ON "user_identities" USING btree ("provider","provider_subject");--> statement-breakpoint
CREATE INDEX "user_identities_user_idx" ON "user_identities" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_is_active_idx" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_memberships_tenant_user_unique" ON "tenant_memberships" USING btree ("tenant_id","user_id");--> statement-breakpoint
CREATE INDEX "tenant_memberships_tenant_status_idx" ON "tenant_memberships" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "tenant_memberships_user_idx" ON "tenant_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_code_unique" ON "tenants" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_slug_unique" ON "tenants" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tenants_status_idx" ON "tenants" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tenants_owner_user_idx" ON "tenants" USING btree ("owner_user_id");