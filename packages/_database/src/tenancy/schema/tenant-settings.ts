import { jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core"

import { timestampColumns } from "../../helpers/columns"
import { tenants } from "./tenants"

/**
 * Volatile / bulky tenant configuration kept out of `tenants` core row.
 */
export const tenantSettings = pgTable("tenant_settings", {
  tenantId: uuid("tenant_id")
    .primaryKey()
    .references(() => tenants.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  billingEmail: text("billing_email"),
  featureFlags: jsonb("feature_flags")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  uiSettings: jsonb("ui_settings")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  operationalSettings: jsonb("operational_settings")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  auditSettings: jsonb("audit_settings")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  ...timestampColumns,
})

export type TenantSettings = typeof tenantSettings.$inferSelect
export type NewTenantSettings = typeof tenantSettings.$inferInsert
