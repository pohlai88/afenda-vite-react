/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; **mdm** schema (`pgSchema("mdm")`) — tenant master data, parties, items, org graph, policies, sequences. Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/mdm/tenant-policies.schema.ts` — tenant-scoped policy key/value surface (governance / customization).
 */

import { sql } from "drizzle-orm"
import {
  check,
  index,
  jsonb,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import {
  createdUpdatedVersionColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import { statusEnum } from "../shared/enums.schema"
import { mdm } from "./_schema"
import { tenants } from "./tenants.schema"

/**
 * Tenant policy is the canonical customization / governance surface.
 *
 * Use for:
 * - finance rules
 * - numbering rules
 * - posting controls
 * - tax behavior
 * - workflow thresholds
 * - tenant terminology / operational defaults
 *
 * Do not use this table as an excuse to avoid relational modeling.
 */
export const tenantPolicies = mdm.table(
  "tenant_policies",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    policyDomain: varchar("policy_domain", { length: 50 }).notNull(),
    policyKey: varchar("policy_key", { length: 100 }).notNull(),
    dataType: varchar("data_type", { length: 20 }).notNull(),
    policyValue: jsonb("policy_value")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    ...effectiveDateColumns,
    status: statusEnum("status").notNull().default("active"),
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqTenantPolicy: uniqueIndex("uq_tenant_policies").on(
      table.tenantId,
      table.policyDomain,
      table.policyKey,
      table.effectiveFrom
    ),
    idxTenantPolicyLookup: index("idx_tenant_policies_lookup").on(
      table.tenantId,
      table.policyDomain,
      table.policyKey,
      table.effectiveFrom
    ),
    ckDataType: check(
      "ck_tenant_policies_data_type",
      sql`${table.dataType} in ('boolean','integer','numeric','text','json','enum')`
    ),
    ckEffectiveDates: check(
      "ck_tenant_policies_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
  })
)

export type TenantPolicy = typeof tenantPolicies.$inferSelect
export type NewTenantPolicy = typeof tenantPolicies.$inferInsert
