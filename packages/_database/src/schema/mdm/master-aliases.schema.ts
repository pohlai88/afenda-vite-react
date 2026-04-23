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
 * This module: `src/schema/mdm/master-aliases.schema.ts` — dedicated alias registry for MDM identity.
 * **SQL hardening:** `master_domain` + `master_id` polymorphism is validated in `sql/hardening/patch_i_master_domain_validation.sql`; preferred-row uniqueness in `patch_f_master_aliases_preferred.sql` (when applied).
 */

import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  index,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { dataSources } from "../governance/governance-data-sources.schema"
import {
  createdUpdatedVersionColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import { aliasTypeEnum, masterDomainEnum } from "../shared/enums.schema"
import { mdm } from "./_schema"
import { tenants } from "./tenants.schema"

/**
 * Dedicated alias registry for strong MDM identity handling.
 *
 * alias_value must be queryable and governable.
 * master_domain + master_id polymorphism is validated in SQL trigger.
 */
export const masterAliases = mdm.table(
  "master_aliases",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    masterDomain: masterDomainEnum("master_domain").notNull(),
    masterId: uuid("master_id").notNull(),
    aliasType: aliasTypeEnum("alias_type").notNull(),
    aliasValue: varchar("alias_value", { length: 255 }).notNull(),
    sourceSystemId: uuid("source_system_id").references(() => dataSources.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    isPreferred: boolean("is_preferred").notNull().default(false),
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqAliasValue: uniqueIndex("uq_master_aliases_value").on(
      table.tenantId,
      table.masterDomain,
      table.aliasType,
      table.aliasValue
    ),
    idxMasterLookup: index("idx_master_aliases_master").on(
      table.tenantId,
      table.masterDomain,
      table.masterId
    ),
    idxSourceSystem: index("idx_master_aliases_source_system").on(
      table.sourceSystemId
    ),
    ckEffectiveDates: check(
      "ck_master_aliases_dates",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
  })
)

export type MasterAlias = typeof masterAliases.$inferSelect
export type NewMasterAlias = typeof masterAliases.$inferInsert
