/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; read-model resolvers under `src/queries/` (see `queries/README.md`).
 * Import via `@afenda/database` or `@afenda/database/queries`; do not deep-import `src/` from apps.
 * Semantics align with `v_current_tenant_policies` in `src/views/mdm-canonical-views.ts` (same filters as legacy patch K SQL).
 * Not for browser bundles: uses Node pg Pool; DATABASE_URL and pool env are server-side secrets, never VITE_*.
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `queries/resolve-current-tenant-policy.ts` — effective `mdm.tenant_policies` row for domain/key on `asOfDate`.
 */
import { and, desc, eq } from "drizzle-orm"
import type { InferSelectModel } from "drizzle-orm"

import type { DatabaseClient } from "../client"
import { tenantPolicies } from "../schema/mdm/tenant-policies.schema"
import { effectiveOnAsOfDatePredicate } from "./helpers/effective-row"
import { assertIsoDateOnly, todayIsoDateUtc } from "./helpers/iso-date"

export type TenantPolicyRecord = InferSelectModel<typeof tenantPolicies>

export type ResolveCurrentTenantPolicyParams = {
  tenantId: string
  policyDomain: string
  policyKey: string
  /** ISO date `YYYY-MM-DD`; defaults to today (UTC). */
  asOfDate?: string
}

/**
 * Resolve the currently effective tenant policy.
 *
 * Rules:
 * - tenant must match
 * - domain + key must match
 * - status must be active
 * - not deleted
 * - effective dating: `effective_from` / `effective_to` bracket `asOfDate`
 * - latest effective_from wins (tie-break: created_at, then id)
 */
export async function resolveCurrentTenantPolicy(
  db: DatabaseClient,
  params: ResolveCurrentTenantPolicyParams
): Promise<TenantPolicyRecord | null> {
  const { tenantId, policyDomain, policyKey, asOfDate: asOfDateParam } = params

  const asOfDate = asOfDateParam ?? todayIsoDateUtc()
  assertIsoDateOnly(asOfDate, "asOfDate")

  const rows = await db
    .select()
    .from(tenantPolicies)
    .where(
      and(
        eq(tenantPolicies.tenantId, tenantId),
        eq(tenantPolicies.policyDomain, policyDomain),
        eq(tenantPolicies.policyKey, policyKey),
        eq(tenantPolicies.status, "active"),
        eq(tenantPolicies.isDeleted, false),
        effectiveOnAsOfDatePredicate(
          tenantPolicies.effectiveFrom,
          tenantPolicies.effectiveTo,
          asOfDate
        )
      )
    )
    .orderBy(
      desc(tenantPolicies.effectiveFrom),
      desc(tenantPolicies.createdAt),
      desc(tenantPolicies.id)
    )
    .limit(1)

  return rows[0] ?? null
}
