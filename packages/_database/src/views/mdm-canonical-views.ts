/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; canonical **read-model views** under `src/views/` (re-exported via `src/schema/index.ts` for Drizzle Kit). Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/views/mdm-canonical-views.ts` — MDM `pgView` read models (`v_current_tenant_policies`, `v_golden_parties`, `v_golden_items`); aligns with `sql/hardening/patch_k_canonical_views.sql` intent (Drizzle-owned `CREATE VIEW`).
 */
import { and, eq, gte, isNull, lte, or, sql } from "drizzle-orm"
import type { Column } from "drizzle-orm"

import { mdm } from "../schema/mdm/_schema"
import { items } from "../schema/mdm/items.schema"
import { parties } from "../schema/mdm/parties.schema"
import { tenantPolicies } from "../schema/mdm/tenant-policies.schema"

/** Server calendar day (`current_date`) — same semantics as legacy patch K SQL. */
const currentDate = sql`current_date`

/**
 * Rows whose validity range includes “today” in the session timezone: `effective_from <= current_date`
 * and (`effective_to` is null or `effective_to >= current_date`).
 *
 * Exported for unit tests and for any runtime that must mirror `v_*` view predicates with `current_date`.
 */
export function whereEffectiveRangeIncludesToday(
  effectiveFrom: Column,
  effectiveTo: Column
) {
  return and(
    lte(effectiveFrom, currentDate),
    or(isNull(effectiveTo), gte(effectiveTo, currentDate))
  )
}

/** Active tenant policy rows effective “today”. */
export const vCurrentTenantPolicies = mdm
  .view("v_current_tenant_policies")
  .as((qb) =>
    qb
      .select()
      .from(tenantPolicies)
      .where(
        and(
          eq(tenantPolicies.isDeleted, false),
          eq(tenantPolicies.status, "active"),
          whereEffectiveRangeIncludesToday(
            tenantPolicies.effectiveFrom,
            tenantPolicies.effectiveTo
          )
        )
      )
  )

/** Golden party master rows (operational / MDM “truth” slice). */
export const vGoldenParties = mdm.view("v_golden_parties").as((qb) =>
  qb
    .select()
    .from(parties)
    .where(
      and(
        eq(parties.isDeleted, false),
        eq(parties.status, "active"),
        eq(parties.mdmStatus, "golden"),
        whereEffectiveRangeIncludesToday(parties.effectiveFrom, parties.effectiveTo)
      )
    )
)

/** Golden item master rows. */
export const vGoldenItems = mdm.view("v_golden_items").as((qb) =>
  qb
    .select()
    .from(items)
    .where(
      and(
        eq(items.isDeleted, false),
        eq(items.status, "active"),
        eq(items.mdmStatus, "golden"),
        whereEffectiveRangeIncludesToday(items.effectiveFrom, items.effectiveTo)
      )
    )
)
