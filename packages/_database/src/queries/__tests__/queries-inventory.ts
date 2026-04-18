/**
 * Canonical inventory for `src/queries` — keep in sync with `queries/index.ts`.
 *
 * ## Runtime functions (8)
 *
 * | # | Export | File |
 * |---|--------|------|
 * | 1 | `effectiveOnAsOfDatePredicate` | `helpers/effective-row.ts` |
 * | 2 | `todayIsoDateUtc` | `helpers/iso-date.ts` |
 * | 3 | `assertIsoDateOnly` | `helpers/iso-date.ts` |
 * | 4 | `isIsoDateOnly` | `helpers/iso-date.ts` |
 * | 5 | `matchesScope` | `helpers/scope-utils.ts` |
 * | 6 | `resolveCurrentTenantPolicy` | `resolve-current-tenant-policy.ts` |
 * | 7 | `resolveItemSettings` | `resolve-item-settings.ts` |
 * | 8 | `resolveMembershipScope` | `resolve-membership-scope.ts` |
 *
 * ## Features (F1–F9)
 *
 * - **F1** Effective-dating SQL helper (`effectiveOnAsOfDatePredicate`)
 * - **F2** ISO calendar-day guards (`todayIsoDateUtc`, `assertIsoDateOnly`, `isIsoDateOnly`)
 * - **F3** Role scope matching (`matchesScope` × tenant / LE / BU / location)
 * - **F4** Current tenant policy row (`resolveCurrentTenantPolicy`)
 * - **F5** Item entity settings with scope fallback location → BU → LE (`resolveItemSettings`)
 * - **F6** Membership + role scopes in one round-trip (`resolveMembershipScope`)
 */
export const QUERIES_RUNTIME_FUNCTION_NAMES = [
  "effectiveOnAsOfDatePredicate",
  "todayIsoDateUtc",
  "assertIsoDateOnly",
  "isIsoDateOnly",
  "matchesScope",
  "resolveCurrentTenantPolicy",
  "resolveItemSettings",
  "resolveMembershipScope",
] as const

export const EXPECTED_QUERIES_RUNTIME_FUNCTION_COUNT =
  QUERIES_RUNTIME_FUNCTION_NAMES.length

export const QUERIES_FEATURE_COUNT = 9
