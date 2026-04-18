/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; **iam** schema (`pgSchema("iam")`) — login accounts, provider links, memberships, roles, ABAC policies, step-up challenges. Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/iam/tenant-memberships.schema.ts` — `iam.tenant_memberships` user↔tenant + optional `person_id` + default MDM scope FKs (membership ≠ role assignment).
 */
import { sql } from "drizzle-orm"
import {
  check,
  foreignKey,
  index,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { businessUnits } from "../mdm/business-units.schema"
import { legalEntities } from "../mdm/legal-entities.schema"
import { locations } from "../mdm/locations.schema"
import { tenants } from "../mdm/tenants.schema"
import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import {
  membershipStatusEnum,
  membershipTypeEnum,
} from "../shared/enums.schema"
import { iam } from "./_schema"
import { persons } from "./persons.schema"
import { userAccounts } from "./user-accounts.schema"

export const tenantMemberships = iam.table(
  "tenant_memberships",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    userAccountId: uuid("user_account_id")
      .notNull()
      .references(() => userAccounts.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    personId: uuid("person_id").references(() => persons.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    membershipStatus: membershipStatusEnum("membership_status").notNull(),
    membershipType: membershipTypeEnum("membership_type").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    defaultLegalEntityId: uuid("default_legal_entity_id"),
    defaultBusinessUnitId: uuid("default_business_unit_id"),
    defaultLocationId: uuid("default_location_id"),
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqTenantUser: uniqueIndex("uq_tenant_memberships_tenant_user").on(
      table.tenantId,
      table.userAccountId
    ),
    uqTenantIdId: unique("uq_tenant_memberships_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_tenant_memberships_tenant_status").on(
      table.tenantId,
      table.membershipStatus
    ),
    idxUserAccount: index("idx_tenant_memberships_user_account").on(
      table.userAccountId
    ),
    idxPerson: index("idx_tenant_memberships_person").on(table.personId),
    idxDefaultLegalEntity: index(
      "idx_tenant_memberships_default_legal_entity"
    ).on(table.tenantId, table.defaultLegalEntityId),
    idxDefaultBusinessUnit: index(
      "idx_tenant_memberships_default_business_unit"
    ).on(table.tenantId, table.defaultBusinessUnitId),
    idxDefaultLocation: index("idx_tenant_memberships_default_location").on(
      table.tenantId,
      table.defaultLocationId
    ),
    fkDefaultLegalEntity: foreignKey({
      columns: [table.tenantId, table.defaultLegalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_tenant_memberships_default_legal_entity",
    }),
    fkDefaultBusinessUnit: foreignKey({
      columns: [table.tenantId, table.defaultBusinessUnitId],
      foreignColumns: [businessUnits.tenantId, businessUnits.id],
      name: "fk_tenant_memberships_default_business_unit",
    }),
    fkDefaultLocation: foreignKey({
      columns: [table.tenantId, table.defaultLocationId],
      foreignColumns: [locations.tenantId, locations.id],
      name: "fk_tenant_memberships_default_location",
    }),
    ckEndDate: check(
      "ck_tenant_memberships_end_date",
      sql`${table.endedAt} is null or ${table.endedAt} >= ${table.joinedAt}`
    ),
  })
)

export type TenantMembership = typeof tenantMemberships.$inferSelect
export type NewTenantMembership = typeof tenantMemberships.$inferInsert
