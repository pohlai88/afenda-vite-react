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
 * This module: `src/schema/mdm/tenant-label-overrides.schema.ts` — tenant-scoped UI copy overrides per locale (`label_key` + `locale_code`).
 */

import { index, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core"

import { locales } from "../ref/locales.schema"
import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import { mdm } from "./_schema"
import { tenants } from "./tenants.schema"

export const tenantLabelOverrides = mdm.table(
  "tenant_label_overrides",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    labelKey: varchar("label_key", { length: 100 }).notNull(),
    defaultLabel: varchar("default_label", { length: 200 }).notNull(),
    overrideLabel: varchar("override_label", { length: 200 }).notNull(),
    localeCode: varchar("locale_code", { length: 20 })
      .notNull()
      .default("en")
      .references(() => locales.code, {
        onUpdate: "cascade",
        onDelete: "restrict",
      }),
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqTenantLabelLocale: uniqueIndex("uq_tenant_label_overrides").on(
      table.tenantId,
      table.labelKey,
      table.localeCode
    ),
    idxLookup: index("idx_tenant_label_overrides_lookup").on(
      table.tenantId,
      table.localeCode,
      table.labelKey
    ),
  })
)

export type TenantLabelOverride = typeof tenantLabelOverrides.$inferSelect
export type NewTenantLabelOverride = typeof tenantLabelOverrides.$inferInsert
