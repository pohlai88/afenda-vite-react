/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * **Tenancy Zod boundary** (not Drizzle DDL): aliases shared validators for `mdm.tenants` / `iam.tenant_memberships` + params/result shapes for tenancy services. Physical DDL stays in `iam` / `mdm`. Migrations N/A for this file.
 * Import via package exports only (`@afenda/database`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/tenancy/tenancy-boundary.schema.ts` — `tenancy*` Zod exports (`tenancyTenantStatusSchema`, `resolveActiveTenantContextParamsSchema`, `afendaMeContextSchema`, …).
 */
import { z } from "zod"

import {
  sharedGovernanceLevelSchema,
  sharedGenericStatusSchema,
  sharedMembershipStatusSchema,
  sharedMembershipTypeSchema,
  sharedMetadataRecordSchema,
  sharedTenantIdSchema,
  sharedTenantTypeSchema,
  sharedUuidSchema,
} from "../shared/shared-boundary.schema"

/** `mdm.tenants.status` (`generic_status`). */
export const tenancyTenantStatusSchema = sharedGenericStatusSchema

/** `mdm.tenants.tenant_type`. */
export const tenancyTenantTypeSchema = sharedTenantTypeSchema

/** `mdm.tenants.mdm_governance_level`. */
export const tenancyMdmGovernanceLevelSchema = sharedGovernanceLevelSchema

/** `iam.tenant_memberships.membership_status`. */
export const tenancyMembershipStatusSchema = sharedMembershipStatusSchema

/** `iam.tenant_memberships.membership_type`. */
export const tenancyMembershipTypeSchema = sharedMembershipTypeSchema

/** Primary keys and FK UUIDs in tenancy flows. */
export const tenancyUuidSchema = sharedUuidSchema

/** `tenant_id` on tenant-scoped rows. */
export const tenancyTenantIdSchema = sharedTenantIdSchema

/** `metadata` jsonb on membership / tenant payloads. */
export const tenancyMetadataRecordSchema = sharedMetadataRecordSchema

/** Serializable params for `resolveActiveTenantContext` (excludes `db`). */
export const resolveActiveTenantContextParamsSchema = z.object({
  authUserId: z.string().min(1),
  authProvider: z.string().min(1).default("better-auth"),
  authSessionId: z.string().nullable().optional(),
  activeTenantId: sharedTenantIdSchema.nullable().optional(),
})

export type ResolveActiveTenantContextParams = z.infer<
  typeof resolveActiveTenantContextParamsSchema
>

/** `resolveAfendaMeContextFromBetterAuthUserId` / `requireAfendaMeContextFromBetterAuthUserId` result shape. */
export const afendaMeContextSchema = z.object({
  afendaUserId: sharedUuidSchema,
  tenantIds: z.array(sharedTenantIdSchema),
  defaultTenantId: sharedTenantIdSchema.nullable(),
})

export type AfendaMeContextValidated = z.infer<typeof afendaMeContextSchema>

export type TenancyTenantStatus = z.infer<typeof tenancyTenantStatusSchema>
export type TenancyTenantType = z.infer<typeof tenancyTenantTypeSchema>
export type TenancyMembershipStatus = z.infer<
  typeof tenancyMembershipStatusSchema
>
export type TenancyMembershipType = z.infer<typeof tenancyMembershipTypeSchema>
