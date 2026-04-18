/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * IAM **Zod boundary** (not Drizzle DDL): enums and insert DTOs aligned with `iam.tenant_roles`, `iam.tenant_memberships`, `iam.tenant_role_assignments`, `iam.authority_policies`; `.schema.ts` satisfies `scripts/guard-schema-modules.ts`. Keep in sync when sibling DDL changes. Migrations N/A for this file.
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/iam/iam-boundary.schema.ts` — Zod v4 payloads for roles, memberships, scoped assignments, authority policies.
 */
import { z } from "zod"

const uuid = (message = "Invalid id") => z.uuid({ error: message })

export const iamMembershipStatusSchema = z.enum([
  "invited",
  "active",
  "suspended",
  "revoked",
])

export const iamMembershipTypeSchema = z.enum([
  "employee",
  "partner",
  "auditor",
  "consultant",
  "system",
])

export const iamRoleCategorySchema = z.enum([
  "finance",
  "procurement",
  "sales",
  "inventory",
  "hr",
  "admin",
  "audit",
  "it",
  "executive",
])

export const iamRoleScopeTypeSchema = z.enum([
  "tenant",
  "legal_entity",
  "business_unit",
  "location",
])

export const iamPolicyEffectSchema = z.enum(["allow", "deny"])

export const iamGenericStatusSchema = z.enum([
  "draft",
  "active",
  "inactive",
  "blocked",
  "suspended",
  "archived",
])

/** Insert-style payload for `iam.tenant_roles`. */
export const iamTenantRoleInsertSchema = z.object({
  tenantId: uuid(),
  roleCode: z.string().trim().min(1).max(50),
  roleName: z.string().trim().min(1).max(200),
  roleCategory: iamRoleCategorySchema,
  isSystemRole: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

/** Insert-style payload for `iam.tenant_memberships`. */
export const iamTenantMembershipInsertSchema = z.object({
  tenantId: uuid(),
  userAccountId: uuid(),
  personId: uuid().optional().nullable(),
  membershipStatus: iamMembershipStatusSchema,
  membershipType: iamMembershipTypeSchema,
  joinedAt: z.coerce.date().optional(),
  endedAt: z.coerce.date().optional().nullable(),
  defaultLegalEntityId: uuid().optional().nullable(),
  defaultBusinessUnitId: uuid().optional().nullable(),
  defaultLocationId: uuid().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/u, { error: "Expected ISO date (YYYY-MM-DD)" })

/** Insert-style payload for `iam.tenant_role_assignments`. */
export const iamTenantRoleAssignmentInsertSchema = z
  .object({
    tenantId: uuid(),
    tenantMembershipId: uuid(),
    tenantRoleId: uuid(),
    scopeType: iamRoleScopeTypeSchema,
    scopeId: uuid().optional().nullable(),
    effectiveFrom: isoDateString.optional(),
    effectiveTo: isoDateString.optional().nullable(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.scopeType === "tenant" && data.scopeId != null) {
      ctx.addIssue({
        code: "custom",
        path: ["scopeId"],
        message: "scope_id must be null when scope_type is tenant",
      })
    }
    if (
      data.scopeType !== "tenant" &&
      (data.scopeId === null || data.scopeId === undefined)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["scopeId"],
        message: "scope_id is required when scope_type is not tenant",
      })
    }
    if (
      data.effectiveFrom &&
      data.effectiveTo &&
      data.effectiveTo < data.effectiveFrom
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["effectiveTo"],
        message: "effective_to must be on or after effective_from",
      })
    }
  })

/** Insert-style payload for `iam.authority_policies`. */
export const iamAuthorityPolicyInsertSchema = z.object({
  tenantId: uuid(),
  tenantRoleId: uuid(),
  policyCode: z.string().trim().min(1).max(100),
  resourceCode: z.string().trim().min(1).max(100),
  actionCode: z.string().trim().min(1).max(100),
  effect: iamPolicyEffectSchema.optional(),
  status: iamGenericStatusSchema.optional(),
  conditionJson: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})
