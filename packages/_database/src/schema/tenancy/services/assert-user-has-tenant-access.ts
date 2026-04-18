/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Tenancy **service** (not DDL): boolean guard using `resolveAfendaMeContextFromBetterAuthUserId` to test `tenantId` membership. Migrations N/A for this file.
 * Import via package exports only (`@afenda/database`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/tenancy/services/assert-user-has-tenant-access.ts` — `assertUserHasTenantAccess`.
 */
import type { DatabaseClient } from "../../../client"

import { resolveAfendaMeContextFromBetterAuthUserId } from "./resolve-afenda-me-context"

export async function assertUserHasTenantAccess(
  db: DatabaseClient,
  betterAuthUserId: string,
  tenantId: string
): Promise<boolean> {
  const ctx = await resolveAfendaMeContextFromBetterAuthUserId(
    db,
    betterAuthUserId
  )
  if (!ctx) {
    return false
  }
  return ctx.tenantIds.includes(tenantId)
}
