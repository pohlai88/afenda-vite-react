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
 * This module: `src/schema/iam/tenant-role-assignments.schema.ts` — `iam.tenant_role_assignments` membership↔role with scope; CHECK + `patch_m` / `patch_n` hardening for scope refs and temporal non-overlap.
 */
import { sql } from "drizzle-orm"
import {
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
import { roleScopeTypeEnum } from "../shared/enums.schema"
import { iam } from "./_schema"
import { tenantMemberships } from "./tenant-memberships.schema"
import { tenantRoles } from "./tenant-roles.schema"

export const tenantRoleAssignments = iam.table(
  "tenant_role_assignments",
  {
    ...idColumn,
    tenantId: uuid("tenant_id").notNull(),
    tenantMembershipId: uuid("tenant_membership_id").notNull(),
    tenantRoleId: uuid("tenant_role_id").notNull(),
    scopeType: roleScopeTypeEnum("scope_type").notNull(),
    scopeId: uuid("scope_id"),
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqAssignment: uniqueIndex("uq_role_assignments").on(
      table.tenantId,
      table.tenantMembershipId,
      table.tenantRoleId,
      table.scopeType,
      table.scopeId,
      table.effectiveFrom
    ),
    idxTenantMembership: index("idx_role_assignments_tenant_membership").on(
      table.tenantId,
      table.tenantMembershipId
    ),
    idxTenantRole: index("idx_role_assignments_tenant_role").on(
      table.tenantId,
      table.tenantRoleId
    ),
    fkMembership: foreignKey({
      columns: [table.tenantId, table.tenantMembershipId],
      foreignColumns: [tenantMemberships.tenantId, tenantMemberships.id],
      name: "fk_role_assignments_membership",
    }),
    fkRole: foreignKey({
      columns: [table.tenantId, table.tenantRoleId],
      foreignColumns: [tenantRoles.tenantId, tenantRoles.id],
      name: "fk_role_assignments_role",
    }),
    ckEffectiveDates: check(
      "ck_role_assignments_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
    ckScopePresence: check(
      "ck_role_assignments_scope_presence",
      sql`(
        (${table.scopeType} = 'tenant' and ${table.scopeId} is null)
        or
        (${table.scopeType} in ('legal_entity','business_unit','location') and ${table.scopeId} is not null)
      )`
    ),
  })
)

export type TenantRoleAssignment = typeof tenantRoleAssignments.$inferSelect
export type NewTenantRoleAssignment = typeof tenantRoleAssignments.$inferInsert
