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
 * This module: `src/schema/iam/tenant-roles.schema.ts` — `iam.tenant_roles` per-tenant role catalog (`tenant_role_assignments` binds memberships to roles in scope).
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
import { roleCategoryEnum } from "../shared/enums.schema"
import { iam } from "./_schema"

export const tenantRoles = iam.table(
  "tenant_roles",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    roleCode: varchar("role_code", { length: 50 }).notNull(),
    roleName: varchar("role_name", { length: 200 }).notNull(),
    roleCategory: roleCategoryEnum("role_category").notNull(),
    isSystemRole: boolean("is_system_role").notNull().default(false),
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqTenantRoleCode: uniqueIndex("uq_tenant_roles_tenant_role_code").on(
      table.tenantId,
      table.roleCode
    ),
    uqTenantIdId: unique("uq_tenant_roles_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantCategory: index("idx_tenant_roles_tenant_category").on(
      table.tenantId,
      table.roleCategory
    ),
  })
)

export type TenantRole = typeof tenantRoles.$inferSelect
export type NewTenantRole = typeof tenantRoles.$inferInsert
