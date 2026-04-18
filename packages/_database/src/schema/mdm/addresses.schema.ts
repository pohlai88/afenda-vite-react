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
 * This module: `src/schema/mdm/addresses.schema.ts` — tenant-scoped postal / structured address root; FK target for `mdm.locations.address_id`. Extend columns in migrations as needed.
 */

import { index, unique, uuid } from "drizzle-orm/pg-core"

import { timestampColumns } from "../shared/columns.schema"
import { mdm } from "./_schema"
import { tenants } from "./tenants.schema"

export const addresses = mdm.table(
  "addresses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    ...timestampColumns,
  },
  (t) => ({
    uqTenantIdId: unique("uq_addresses_tenant_id_id").on(t.tenantId, t.id),
    tenantIdx: index("idx_mdm_addresses_tenant").on(t.tenantId),
  })
)

export type Address = typeof addresses.$inferSelect
export type NewAddress = typeof addresses.$inferInsert
