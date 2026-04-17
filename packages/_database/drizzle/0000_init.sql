CREATE EXTENSION IF NOT EXISTS pgcrypto;
--> statement-breakpoint
CREATE SCHEMA "finance";
--> statement-breakpoint
CREATE SCHEMA "governance";
--> statement-breakpoint
CREATE SCHEMA "iam";
--> statement-breakpoint
CREATE SCHEMA "mdm";
--> statement-breakpoint
CREATE SCHEMA "ref";
--> statement-breakpoint
CREATE TYPE "public"."audit_actor_type" AS ENUM('person', 'service', 'system', 'integration', 'scheduler', 'migration', 'policy_engine', 'ai', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."audit_outcome" AS ENUM('success', 'rejected', 'failed', 'partial');--> statement-breakpoint
CREATE TYPE "public"."audit_source_channel" AS ENUM('ui', 'api', 'workflow', 'job', 'import', 'replay', 'system');--> statement-breakpoint
CREATE TYPE "public"."deployment_environment" AS ENUM('production', 'prod', 'staging', 'sandbox', 'dev');--> statement-breakpoint
CREATE TYPE "public"."auth_challenge_method" AS ENUM('passkey', 'totp', 'email_otp');--> statement-breakpoint
CREATE TYPE "public"."auth_challenge_status" AS ENUM('issued', 'verified', 'consumed', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."tenant_membership_status" AS ENUM('invited', 'active', 'suspended', 'left', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."tenant_membership_type" AS ENUM('internal', 'external', 'service');--> statement-breakpoint
CREATE TYPE "public"."tenant_status" AS ENUM('active', 'suspended', 'archived');--> statement-breakpoint
CREATE TABLE "governance"."audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"membership_id" uuid,
	"auth_user_id" text,
	"actor_type" "audit_actor_type" DEFAULT 'unknown' NOT NULL,
	"actor_user_id" uuid,
	"acting_as_user_id" uuid,
	"action" text NOT NULL,
	"subject_type" text NOT NULL,
	"subject_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"outcome" "audit_outcome" DEFAULT 'success' NOT NULL,
	"source_channel" "audit_source_channel" DEFAULT 'api' NOT NULL,
	"request_id" text,
	"trace_id" text,
	"correlation_id" text,
	"command_id" text,
	"session_id" text,
	"environment" "deployment_environment" DEFAULT 'production' NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iam"."auth_challenges" (
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
CREATE TABLE "iam"."identity_links" (
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
CREATE TABLE "iam"."tenant_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"membership_type" "tenant_membership_type" DEFAULT 'internal' NOT NULL,
	"status" "tenant_membership_status" DEFAULT 'invited' NOT NULL,
	"invited_at" timestamp with time zone,
	"joined_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_iam_tenant_memberships_tenant_id_id" UNIQUE("id","tenant_id")
);
--> statement-breakpoint
CREATE TABLE "iam"."user_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iam"."user_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_subject" text NOT NULL,
	"email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mdm"."tenants" (
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
CREATE TABLE "ref"."currencies" (
	"code" char(3) PRIMARY KEY NOT NULL,
	"numeric_code" char(3),
	"name" varchar(100) NOT NULL,
	"symbol" varchar(10),
	"minor_unit" smallint DEFAULT 2 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"version_no" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_currencies_minor_unit" CHECK ("ref"."currencies"."minor_unit" >= 0 and "ref"."currencies"."minor_unit" <= 6)
);
--> statement-breakpoint
ALTER TABLE "governance"."audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "mdm"."tenants"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "governance"."audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_user_accounts_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "iam"."user_accounts"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "governance"."audit_logs" ADD CONSTRAINT "audit_logs_acting_as_user_id_user_accounts_id_fk" FOREIGN KEY ("acting_as_user_id") REFERENCES "iam"."user_accounts"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "governance"."audit_logs" ADD CONSTRAINT "fk_governance_audit_logs_membership_tenant" FOREIGN KEY ("tenant_id","membership_id") REFERENCES "iam"."tenant_memberships"("tenant_id","id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam"."identity_links" ADD CONSTRAINT "identity_links_afenda_user_id_user_accounts_id_fk" FOREIGN KEY ("afenda_user_id") REFERENCES "iam"."user_accounts"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "iam"."tenant_memberships" ADD CONSTRAINT "tenant_memberships_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "mdm"."tenants"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "iam"."tenant_memberships" ADD CONSTRAINT "tenant_memberships_user_id_user_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "iam"."user_accounts"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "iam"."user_identities" ADD CONSTRAINT "user_identities_user_id_user_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "iam"."user_accounts"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "mdm"."tenants" ADD CONSTRAINT "tenants_base_currency_code_currencies_code_fk" FOREIGN KEY ("base_currency_code") REFERENCES "ref"."currencies"("code") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "mdm"."tenants" ADD CONSTRAINT "tenants_owner_user_id_user_accounts_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "iam"."user_accounts"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_governance_audit_logs_tenant_recorded" ON "governance"."audit_logs" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_governance_audit_logs_tenant_action_recorded" ON "governance"."audit_logs" USING btree ("tenant_id","action","created_at");--> statement-breakpoint
CREATE INDEX "idx_governance_audit_logs_tenant_subject_recorded" ON "governance"."audit_logs" USING btree ("tenant_id","subject_type","subject_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_governance_audit_logs_request" ON "governance"."audit_logs" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "idx_governance_audit_logs_trace" ON "governance"."audit_logs" USING btree ("trace_id");--> statement-breakpoint
CREATE INDEX "idx_governance_audit_logs_correlation" ON "governance"."audit_logs" USING btree ("correlation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_iam_auth_challenges_challenge_id" ON "iam"."auth_challenges" USING btree ("challenge_id");--> statement-breakpoint
CREATE INDEX "idx_iam_auth_challenges_subject_user_id" ON "iam"."auth_challenges" USING btree ("subject_user_id");--> statement-breakpoint
CREATE INDEX "idx_iam_auth_challenges_subject_email" ON "iam"."auth_challenges" USING btree ("subject_email");--> statement-breakpoint
CREATE INDEX "idx_iam_auth_challenges_status_expires" ON "iam"."auth_challenges" USING btree ("status","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_iam_identity_links_provider_ba_user" ON "iam"."identity_links" USING btree ("auth_provider","better_auth_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_iam_identity_links_one_primary_per_provider" ON "iam"."identity_links" USING btree ("afenda_user_id","auth_provider") WHERE "iam"."identity_links"."is_primary" = true;--> statement-breakpoint
CREATE INDEX "idx_iam_identity_links_afenda_user" ON "iam"."identity_links" USING btree ("afenda_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_iam_tenant_memberships_tenant_user" ON "iam"."tenant_memberships" USING btree ("tenant_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_iam_tenant_memberships_tenant_status" ON "iam"."tenant_memberships" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "idx_iam_tenant_memberships_user" ON "iam"."tenant_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_iam_user_accounts_email" ON "iam"."user_accounts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_iam_user_accounts_is_active" ON "iam"."user_accounts" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_iam_user_identities_provider_subject" ON "iam"."user_identities" USING btree ("provider","provider_subject");--> statement-breakpoint
CREATE INDEX "idx_iam_user_identities_user" ON "iam"."user_identities" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_mdm_tenants_code" ON "mdm"."tenants" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_mdm_tenants_slug" ON "mdm"."tenants" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_mdm_tenants_status" ON "mdm"."tenants" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_currencies_name" ON "ref"."currencies" USING btree ("name");
--> statement-breakpoint
INSERT INTO "ref"."currencies" ("code", "name", "minor_unit")
VALUES ('USD', 'US Dollar', 2)
ON CONFLICT ("code") DO NOTHING;