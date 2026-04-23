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
 * This module: `src/schema/mdm/external-identities.schema.ts` — source-system identity mapping for integration-safe sync.
 * **last_synced_at:** `timestamptz` in DDL — never `varchar`; integration code may still serialize for APIs separately.
 * **SQL hardening:** `master_domain` + `master_id` polymorphism validated in `sql/hardening/patch_i_master_domain_validation.sql` when applied.
 */

import {
  index,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { dataSources } from "../governance/governance-data-sources.schema"
import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import { masterDomainEnum } from "../shared/enums.schema"
import { mdm } from "./_schema"
import { tenants } from "./tenants.schema"

export const externalIdentities = mdm.table(
  "external_identities",
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
    sourceSystemId: uuid("source_system_id")
      .notNull()
      .references(() => dataSources.id, {
        onUpdate: "cascade",
        onDelete: "restrict",
      }),
    externalObjectType: varchar("external_object_type", {
      length: 50,
    }).notNull(),
    externalId: varchar("external_id", { length: 255 }).notNull(),
    externalCode: varchar("external_code", { length: 100 }),
    syncStatus: varchar("sync_status", { length: 20 })
      .notNull()
      .default("pending"),
    /** Last successful sync instant (`timestamptz`). */
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqExternalIdentity: uniqueIndex("uq_external_identities").on(
      table.tenantId,
      table.sourceSystemId,
      table.externalObjectType,
      table.externalId
    ),
    idxMasterLookup: index("idx_external_identities_master").on(
      table.tenantId,
      table.masterDomain,
      table.masterId
    ),
  })
)

export type ExternalIdentity = typeof externalIdentities.$inferSelect
export type NewExternalIdentity = typeof externalIdentities.$inferInsert
