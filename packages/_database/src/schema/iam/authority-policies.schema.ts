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
 * This module: `src/schema/iam/authority-policies.schema.ts` — `iam.authority_policies` ABAC rows per `tenant_role` (`uq_authority_policies_role_policy` vs `uq_authority_policies_role_resource_action` are different axes — avoid duplicate permission encoding in app code).
 */
import { sql } from "drizzle-orm"
import {
  foreignKey,
  index,
  jsonb,
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
import { policyEffectEnum, statusEnum } from "../shared/enums.schema"
import { iam } from "./_schema"
import { tenantRoles } from "./tenant-roles.schema"

export const authorityPolicies = iam.table(
  "authority_policies",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    tenantRoleId: uuid("tenant_role_id").notNull(),
    policyCode: varchar("policy_code", { length: 100 }).notNull(),
    resourceCode: varchar("resource_code", { length: 100 }).notNull(),
    actionCode: varchar("action_code", { length: 100 }).notNull(),
    effect: policyEffectEnum("effect").notNull().default("allow"),
    status: statusEnum("status").notNull().default("active"),
    conditionJson: jsonb("condition_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqRolePolicy: uniqueIndex("uq_authority_policies_role_policy").on(
      table.tenantId,
      table.tenantRoleId,
      table.policyCode
    ),
    uqRoleResourceAction: uniqueIndex(
      "uq_authority_policies_role_resource_action"
    ).on(
      table.tenantId,
      table.tenantRoleId,
      table.resourceCode,
      table.actionCode,
      table.effect
    ),
    idxLookup: index("idx_authority_policies_lookup").on(
      table.tenantId,
      table.tenantRoleId,
      table.resourceCode,
      table.actionCode
    ),
    fkRole: foreignKey({
      columns: [table.tenantId, table.tenantRoleId],
      foreignColumns: [tenantRoles.tenantId, tenantRoles.id],
      name: "fk_authority_policies_role",
    }),
  })
)

export type AuthorityPolicy = typeof authorityPolicies.$inferSelect
export type NewAuthorityPolicy = typeof authorityPolicies.$inferInsert
