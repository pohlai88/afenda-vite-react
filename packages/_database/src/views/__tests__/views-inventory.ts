/**
 * Canonical inventory for `src/views` — keep in sync with `views/index.ts` and `mdm-canonical-views.ts`.
 *
 * ## Runtime exports (3)
 *
 * | # | Export | PostgreSQL view (`mdm.*`) |
 * |---|--------|---------------------------|
 * | 1 | `vCurrentTenantPolicies` | `v_current_tenant_policies` |
 * | 2 | `vGoldenParties` | `v_golden_parties` |
 * | 3 | `vGoldenItems` | `v_golden_items` |
 *
 * ## Features (F1–F3)
 *
 * - **F1** Current tenant policies — `tenant_policies` rows that are active, not deleted, and effective on `current_date`
 * - **F2** Golden parties — `parties` golden / active / not deleted / effective “today”
 * - **F3** Golden items — same slice for `items`
 *
 * ## Helpers
 *
 * - **`whereEffectiveRangeIncludesToday`** — shared `effective_from` / `effective_to` bracket vs `current_date` (exported from `mdm-canonical-views.ts` for tests)
 */
export const VIEW_EXPORT_NAMES = [
  "vCurrentTenantPolicies",
  "vGoldenItems",
  "vGoldenParties",
] as const

export const PG_VIEW_NAME_BY_EXPORT = {
  vCurrentTenantPolicies: "v_current_tenant_policies",
  vGoldenItems: "v_golden_items",
  vGoldenParties: "v_golden_parties",
} as const satisfies Record<(typeof VIEW_EXPORT_NAMES)[number], string>

export const EXPECTED_VIEW_EXPORT_COUNT = VIEW_EXPORT_NAMES.length

export const VIEWS_FEATURE_COUNT = 3

export const MDM_PG_SCHEMA = "mdm"
