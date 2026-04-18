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
 * This module: `src/schema/finance/legal-entity-coa-assignments.schema.ts` — `finance.legal_entity_coa_assignments` effective-dated LE↔COA; `is_primary` not uniqueness-enforced across ranges (app or future exclusion constraint).
 */
import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  foreignKey,
  index,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { legalEntities } from "../mdm/legal-entities.schema"
import { tenants } from "../mdm/tenants.schema"
import {
  createdUpdatedVersionColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import { statusEnum } from "../shared/enums.schema"
import { chartOfAccountSets } from "./chart-of-account-sets.schema"
import { finance } from "./_schema"

export const legalEntityCoaAssignments = finance.table(
  "legal_entity_coa_assignments",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    legalEntityId: uuid("legal_entity_id").notNull(),
    coaSetId: uuid("coa_set_id").notNull(),
    isPrimary: boolean("is_primary").notNull().default(true),
    status: statusEnum("status").notNull().default("active"),
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqRawAssignment: uniqueIndex("uq_legal_entity_coa_assignments_raw").on(
      table.tenantId,
      table.legalEntityId,
      table.coaSetId,
      table.effectiveFrom
    ),
    idxLookup: index("idx_legal_entity_coa_assignments_lookup").on(
      table.tenantId,
      table.legalEntityId,
      table.status,
      table.effectiveFrom
    ),
    fkLegalEntity: foreignKey({
      columns: [table.tenantId, table.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_legal_entity_coa_assignments_legal_entity",
    }),
    fkCoaSet: foreignKey({
      columns: [table.tenantId, table.coaSetId],
      foreignColumns: [chartOfAccountSets.tenantId, chartOfAccountSets.id],
      name: "fk_legal_entity_coa_assignments_coa_set",
    }),
    ckEffectiveDates: check(
      "ck_legal_entity_coa_assignments_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
  })
)

export type LegalEntityCoaAssignment = typeof legalEntityCoaAssignments.$inferSelect
export type NewLegalEntityCoaAssignment = typeof legalEntityCoaAssignments.$inferInsert
