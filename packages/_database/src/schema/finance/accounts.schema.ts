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
 * This module: `src/schema/finance/accounts.schema.ts` — `finance.accounts` GL accounts; composite `(tenant_id, id)` FK target; tenant-safe self-FK on `(tenant_id, parent_account_id)`.
 */
import {
  boolean,
  foreignKey,
  index,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { tenants } from "../mdm/tenants.schema"
import {
  aliasesColumn,
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import {
  accountTypeEnum,
  normalBalanceEnum,
  postingTypeEnum,
  statusEnum,
} from "../shared/enums.schema"
import { chartOfAccountSets } from "./chart-of-account-sets.schema"
import { finance } from "./_schema"

/**
 * Account remains tenant-scoped even when keyed by COA set.
 *
 * Parent-child hierarchy is retained but should be cycle-checked separately if needed.
 */
export const accounts = finance.table(
  "accounts",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    coaSetId: uuid("coa_set_id").notNull(),
    parentAccountId: uuid("parent_account_id"),
    accountCode: varchar("account_code", { length: 50 }).notNull(),
    accountName: varchar("account_name", { length: 200 }).notNull(),
    accountType: accountTypeEnum("account_type").notNull(),
    postingType: postingTypeEnum("posting_type").notNull(),
    normalBalance: normalBalanceEnum("normal_balance").notNull(),
    isControlAccount: boolean("is_control_account").notNull().default(false),
    status: statusEnum("status").notNull().default("active"),
    ...aliasesColumn,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqCoaCode: uniqueIndex("uq_accounts_coa_code").on(
      table.coaSetId,
      table.accountCode
    ),
    uqTenantIdId: unique("uq_accounts_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_accounts_tenant_status").on(
      table.tenantId,
      table.status
    ),
    idxTenantCoaSet: index("idx_accounts_tenant_coa_set").on(
      table.tenantId,
      table.coaSetId
    ),
    fkCoaSet: foreignKey({
      columns: [table.tenantId, table.coaSetId],
      foreignColumns: [chartOfAccountSets.tenantId, chartOfAccountSets.id],
      name: "fk_accounts_coa_set",
    }),
    fkParent: foreignKey({
      columns: [table.tenantId, table.parentAccountId],
      foreignColumns: [table.tenantId, table.id],
      name: "fk_accounts_parent",
    }),
  })
)

export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert
