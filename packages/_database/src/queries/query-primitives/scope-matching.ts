/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; read-model resolvers and pure helpers under `src/queries/` (see `queries/README.md`).
 * Import via `@afenda/database` or `@afenda/database/queries`; do not deep-import `src/` from apps.
 * Scope rules align with `iam.tenant_role_assignments` and tenant RLS / scope patches under `sql/hardening/` (e.g. `patch_m_*`, `patch_n_*`) as deployed.
 * Not for browser bundles: uses Node pg Pool; DATABASE_URL and pool env are server-side secrets, never VITE_*.
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `queries/query-primitives/scope-matching.ts` — pure `matchesScope` for role assignment `scope_type` / `scope_id` vs runtime LE/BU/location (no I/O).
 */
export type RoleScopeType =
  | "tenant"
  | "legal_entity"
  | "business_unit"
  | "location"

export type ScopeMatchInput = {
  scopeType: RoleScopeType
  scopeId: string | null
  tenantId: string
  legalEntityId?: string | null
  businessUnitId?: string | null
  locationId?: string | null
}

/**
 * Returns true if an assignment scope covers the target runtime scope.
 *
 * - **`tenant`:** assignment applies tenant-wide; `scopeId` is not compared (product: tenant-level role).
 * - **`legal_entity` | `business_unit` | `location`:** `scopeId` must equal the corresponding runtime id.
 */
export function matchesScope(input: ScopeMatchInput): boolean {
  const { scopeType, scopeId, legalEntityId, businessUnitId, locationId } =
    input

  if (scopeType === "tenant") {
    return true
  }

  if (scopeType === "legal_entity") {
    return scopeId != null && scopeId === legalEntityId
  }

  if (scopeType === "business_unit") {
    return scopeId != null && scopeId === businessUnitId
  }

  if (scopeType === "location") {
    return scopeId != null && scopeId === locationId
  }

  return false
}
