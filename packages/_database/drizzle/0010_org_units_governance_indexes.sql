-- Tenant-scoped indexes for org unit kind and hierarchy; align `kind` default with governance model.

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_units_tenant_kind_idx" ON "org_units" USING btree ("tenant_id","kind");

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_units_tenant_parent_idx" ON "org_units" USING btree ("tenant_id","parent_org_unit_id");

--> statement-breakpoint
ALTER TABLE "org_units" ALTER COLUMN "kind" SET DEFAULT 'department';

--> statement-breakpoint
UPDATE "org_units" SET "kind" = 'department' WHERE "kind" = 'unit';
