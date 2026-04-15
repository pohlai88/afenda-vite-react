-- Enterprise physical model (ADR-0003–0006): identity bridge, tenant dimensions, unified scopes, audit bindings.
-- Safe to run once; assumes prior migrations 0000–0007 applied.

--> statement-breakpoint
DO $$ BEGIN
  ALTER TYPE "tenant_membership_status" ADD VALUE 'revoked';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

--> statement-breakpoint
CREATE TYPE "membership_scope_type" AS ENUM('tenant', 'legal_entity', 'business_unit', 'location', 'org_unit');

--> statement-breakpoint
CREATE TYPE "membership_scope_access_mode" AS ENUM('include', 'exclude');

--> statement-breakpoint
CREATE TYPE "role_permission_effect" AS ENUM('allow', 'deny');

--> statement-breakpoint
CREATE TYPE "tenant_membership_type" AS ENUM('internal', 'external', 'service', 'partner');

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
ALTER TABLE "identity_links" ADD CONSTRAINT "identity_links_afenda_user_id_users_id_fk" FOREIGN KEY ("afenda_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;

--> statement-breakpoint
CREATE UNIQUE INDEX "identity_links_provider_ba_user_unique" ON "identity_links" USING btree ("auth_provider","better_auth_user_id");

--> statement-breakpoint
CREATE UNIQUE INDEX "identity_links_one_primary_per_provider" ON "identity_links" USING btree ("afenda_user_id","auth_provider") WHERE "is_primary" = true;

--> statement-breakpoint
CREATE INDEX "identity_links_afenda_user_idx" ON "identity_links" USING btree ("afenda_user_id");

--> statement-breakpoint
CREATE TABLE "tenant_settings" (
	"tenant_id" uuid PRIMARY KEY NOT NULL,
	"billing_email" text,
	"feature_flags" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ui_settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"operational_settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"audit_settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD CONSTRAINT "tenant_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE cascade;

--> statement-breakpoint
CREATE TABLE "business_units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"code" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"parent_business_unit_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "business_units_id_tenant_unique" UNIQUE("id","tenant_id")
);

--> statement-breakpoint
ALTER TABLE "business_units" ADD CONSTRAINT "business_units_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE cascade;

--> statement-breakpoint
ALTER TABLE "business_units" ADD CONSTRAINT "business_units_parent_tenant_fk" FOREIGN KEY ("parent_business_unit_id","tenant_id") REFERENCES "public"."business_units"("id","tenant_id") ON DELETE restrict ON UPDATE cascade;

--> statement-breakpoint
CREATE UNIQUE INDEX "business_units_tenant_code_unique" ON "business_units" USING btree ("tenant_id","code");

--> statement-breakpoint
CREATE INDEX "business_units_tenant_status_idx" ON "business_units" USING btree ("tenant_id","status");

--> statement-breakpoint
CREATE INDEX "business_units_parent_idx" ON "business_units" USING btree ("parent_business_unit_id");

--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"code" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"legal_entity_id" uuid,
	"business_unit_id" uuid,
	"country_code" varchar(2) NOT NULL,
	"region_code" text,
	"city" text,
	"address_line_1" text,
	"address_line_2" text,
	"postal_code" text,
	"timezone" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "locations_id_tenant_unique" UNIQUE("id","tenant_id")
);

--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE cascade;

--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_legal_entity_tenant_fk" FOREIGN KEY ("legal_entity_id","tenant_id") REFERENCES "public"."legal_entities"("id","tenant_id") ON DELETE set null ON UPDATE cascade;

--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_business_unit_tenant_fk" FOREIGN KEY ("business_unit_id","tenant_id") REFERENCES "public"."business_units"("id","tenant_id") ON DELETE set null ON UPDATE cascade;

--> statement-breakpoint
CREATE UNIQUE INDEX "locations_tenant_code_unique" ON "locations" USING btree ("tenant_id","code");

--> statement-breakpoint
CREATE INDEX "locations_tenant_legal_entity_idx" ON "locations" USING btree ("tenant_id","legal_entity_id");

--> statement-breakpoint
CREATE INDEX "locations_tenant_business_unit_idx" ON "locations" USING btree ("tenant_id","business_unit_id");

--> statement-breakpoint
CREATE TABLE "membership_scopes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"membership_id" uuid NOT NULL,
	"scope_type" "membership_scope_type" NOT NULL,
	"scope_id" uuid NOT NULL,
	"access_mode" "membership_scope_access_mode" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" uuid
);

--> statement-breakpoint
ALTER TABLE "membership_scopes" ADD CONSTRAINT "membership_scopes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE cascade;

--> statement-breakpoint
ALTER TABLE "membership_scopes" ADD CONSTRAINT "membership_scopes_membership_tenant_fk" FOREIGN KEY ("membership_id","tenant_id") REFERENCES "public"."tenant_memberships"("id","tenant_id") ON DELETE cascade ON UPDATE cascade;

--> statement-breakpoint
ALTER TABLE "membership_scopes" ADD CONSTRAINT "membership_scopes_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;

--> statement-breakpoint
CREATE UNIQUE INDEX "membership_scopes_membership_scope_unique" ON "membership_scopes" USING btree ("membership_id","scope_type","scope_id","access_mode");

--> statement-breakpoint
CREATE INDEX "membership_scopes_tenant_membership_idx" ON "membership_scopes" USING btree ("tenant_id","membership_id");

--> statement-breakpoint
CREATE INDEX "membership_scopes_scope_type_idx" ON "membership_scopes" USING btree ("membership_id","scope_type");

--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "given_name" text;

--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "family_name" text;

--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;

--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_system" boolean DEFAULT false NOT NULL;

--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deactivated_at" timestamp with time zone;

--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "code" varchar(63);

--> statement-breakpoint
UPDATE "tenants" SET "code" = "slug" WHERE "code" IS NULL;

--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "code" SET NOT NULL;

--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_code_unique" ON "tenants" USING btree ("code");

--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "base_currency_code" varchar(3) DEFAULT 'USD' NOT NULL;

--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "default_locale" varchar(35) DEFAULT 'en' NOT NULL;

--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "default_timezone" text DEFAULT 'UTC' NOT NULL;

--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "owner_user_id" uuid;

--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "archived_at" timestamp with time zone;

--> statement-breakpoint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;

--> statement-breakpoint
CREATE INDEX "tenants_owner_user_idx" ON "tenants" USING btree ("owner_user_id");

--> statement-breakpoint
ALTER TABLE "tenant_memberships" ADD COLUMN "membership_type" "tenant_membership_type" DEFAULT 'internal'::tenant_membership_type NOT NULL;

--> statement-breakpoint
ALTER TABLE "tenant_memberships" ADD COLUMN "joined_at" timestamp with time zone;

--> statement-breakpoint
ALTER TABLE "tenant_memberships" ADD COLUMN "suspended_at" timestamp with time zone;

--> statement-breakpoint
ALTER TABLE "tenant_memberships" ADD COLUMN "revoked_at" timestamp with time zone;

--> statement-breakpoint
ALTER TABLE "tenant_memberships" ADD COLUMN "invited_by_user_id" uuid;

--> statement-breakpoint
ALTER TABLE "tenant_memberships" ADD CONSTRAINT "tenant_memberships_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;

--> statement-breakpoint
ALTER TABLE "legal_entities" ADD COLUMN "registration_number" text;

--> statement-breakpoint
ALTER TABLE "legal_entities" ADD COLUMN "country_code" varchar(2);

--> statement-breakpoint
ALTER TABLE "legal_entities" ADD COLUMN "parent_legal_entity_id" uuid;

--> statement-breakpoint
ALTER TABLE "legal_entities" ADD CONSTRAINT "legal_entities_parent_tenant_fk" FOREIGN KEY ("parent_legal_entity_id","tenant_id") REFERENCES "public"."legal_entities"("id","tenant_id") ON DELETE restrict ON UPDATE cascade;

--> statement-breakpoint
CREATE INDEX "legal_entities_parent_idx" ON "legal_entities" USING btree ("parent_legal_entity_id");

--> statement-breakpoint
ALTER TABLE "org_units" ADD COLUMN "business_unit_id" uuid;

--> statement-breakpoint
ALTER TABLE "org_units" ADD COLUMN "location_id" uuid;

--> statement-breakpoint
ALTER TABLE "org_units" ADD COLUMN "manager_user_id" uuid;

--> statement-breakpoint
ALTER TABLE "org_units" ADD CONSTRAINT "org_units_business_unit_tenant_fk" FOREIGN KEY ("business_unit_id","tenant_id") REFERENCES "public"."business_units"("id","tenant_id") ON DELETE set null ON UPDATE cascade;

--> statement-breakpoint
ALTER TABLE "org_units" ADD CONSTRAINT "org_units_location_tenant_fk" FOREIGN KEY ("location_id","tenant_id") REFERENCES "public"."locations"("id","tenant_id") ON DELETE set null ON UPDATE cascade;

--> statement-breakpoint
ALTER TABLE "org_units" ADD CONSTRAINT "org_units_manager_user_fk" FOREIGN KEY ("manager_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;

--> statement-breakpoint
CREATE INDEX "org_units_business_unit_idx" ON "org_units" USING btree ("business_unit_id");

--> statement-breakpoint
CREATE INDEX "org_units_location_idx" ON "org_units" USING btree ("location_id");

--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "membership_id" uuid;

--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "business_unit_id" uuid;

--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "location_id" uuid;

--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "org_unit_id" uuid;

--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "auth_user_id" text;

--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_membership_tenant_fk" FOREIGN KEY ("membership_id","tenant_id") REFERENCES "public"."tenant_memberships"("id","tenant_id") ON DELETE set null ON UPDATE cascade;

--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_business_unit_tenant_fk" FOREIGN KEY ("business_unit_id","tenant_id") REFERENCES "public"."business_units"("id","tenant_id") ON DELETE set null ON UPDATE cascade;

--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_location_tenant_fk" FOREIGN KEY ("location_id","tenant_id") REFERENCES "public"."locations"("id","tenant_id") ON DELETE set null ON UPDATE cascade;

--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_org_unit_tenant_fk" FOREIGN KEY ("org_unit_id","tenant_id") REFERENCES "public"."org_units"("id","tenant_id") ON DELETE set null ON UPDATE cascade;

--> statement-breakpoint
CREATE INDEX "audit_logs_membership_idx" ON "audit_logs" USING btree ("membership_id");

--> statement-breakpoint
ALTER TABLE "role_permissions" ADD COLUMN "effect" "role_permission_effect" DEFAULT 'allow'::role_permission_effect NOT NULL;
