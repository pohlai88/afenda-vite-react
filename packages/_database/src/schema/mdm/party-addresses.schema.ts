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
 * This module: `src/schema/mdm/party-addresses.schema.ts` — links `mdm.parties` to `mdm.addresses` with type and effective dating; composite tenant-safe FK to addresses via `(tenant_id, address_id)`.
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

import {
  createdUpdatedVersionColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import { addressTypeEnum, statusEnum } from "../shared/enums.schema"
import { addresses } from "./addresses.schema"
import { mdm } from "./_schema"
import { parties } from "./parties.schema"
import { tenants } from "./tenants.schema"

export const partyAddresses = mdm.table(
  "party_addresses",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    partyId: uuid("party_id").notNull(),
    addressId: uuid("address_id").notNull(),
    addressType: addressTypeEnum("address_type").notNull().default("primary"),
    isPrimary: boolean("is_primary").notNull().default(false),
    status: statusEnum("status").notNull().default("active"),
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqRawPartyAddress: uniqueIndex("uq_party_addresses_raw").on(
      table.tenantId,
      table.partyId,
      table.addressId,
      table.addressType,
      table.effectiveFrom
    ),
    idxLookup: index("idx_party_addresses_lookup").on(
      table.tenantId,
      table.partyId,
      table.addressType,
      table.effectiveFrom
    ),
    fkParty: foreignKey({
      columns: [table.tenantId, table.partyId],
      foreignColumns: [parties.tenantId, parties.id],
      name: "fk_party_addresses_party",
    }),
    fkAddress: foreignKey({
      columns: [table.tenantId, table.addressId],
      foreignColumns: [addresses.tenantId, addresses.id],
      name: "fk_party_addresses_address",
    }),
    ckEffectiveDates: check(
      "ck_party_addresses_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
  })
)

export type PartyAddress = typeof partyAddresses.$inferSelect
export type NewPartyAddress = typeof partyAddresses.$inferInsert
