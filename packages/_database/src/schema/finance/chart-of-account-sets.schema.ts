/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; **finance** schema (`pgSchema("finance")`) — COA, GL accounts, fiscal calendars/periods, legal-entity COA edges. Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/finance/chart-of-account-sets.schema.ts` — `finance.chart_of_account_sets` tenant COA books; parent for `finance.accounts` and LE assignments.
 */
import {
  boolean,
  index,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { tenants } from "../mdm/tenants.schema"
import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import { statusEnum } from "../shared/enums.schema"
import { finance } from "./_schema"

export const chartOfAccountSets = finance.table(
  "chart_of_account_sets",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    coaCode: varchar("coa_code", { length: 50 }).notNull(),
    coaName: varchar("coa_name", { length: 200 }).notNull(),
    status: statusEnum("status").notNull().default("active"),
    isGroupChart: boolean("is_group_chart").notNull().default(false),
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqTenantCode: uniqueIndex("uq_chart_of_account_sets_tenant_code").on(
      table.tenantId,
      table.coaCode
    ),
    uqTenantIdId: unique("uq_chart_of_account_sets_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_chart_of_account_sets_tenant_status").on(
      table.tenantId,
      table.status
    ),
  })
)

export type ChartOfAccountSet = typeof chartOfAccountSets.$inferSelect
export type NewChartOfAccountSet = typeof chartOfAccountSets.$inferInsert
