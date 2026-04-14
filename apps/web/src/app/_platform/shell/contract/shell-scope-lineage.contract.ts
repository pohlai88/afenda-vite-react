/**
 * SHELL SCOPE LINEAGE CONTRACT
 *
 * **Four positional filters** in the top bar — they are **not** a single global entity
 * hierarchy enforced by the product. Each slot is independent; tenant policy defines what
 * each slot **means** and what the user selects (magic filter).
 *
 * Examples:
 * - Slot 1 = Company "Acme", slot 2 = Company "Subsidiary X", slot 3 = Function "Finance",
 *   slot 4 = Area "AP" (mixed dimensions along a workflow).
 * - Slots 1–4 might all be **Company** (or the same dimension repeated) for treasury /
 *   multi-entity flows — labels and options come from the API, not from a fixed enum of
 *   org types.
 *
 * The **only** product-level enum is **which slot** (1–4). Semantic meaning is in
 * `dimensionLabel` + `label`.
 *
 * Rules:
 * - `slot` identifies chrome position (`level_1` … `level_4`); order is left → right.
 * - `dimensionLabel` = what this filter is *about* for this tenant (dropdown title).
 * - `label` = current selection display value.
 * - Fewer than four segments allowed if tenant hides slots.
 * - Authorization for options is **server-side**; shell is UX only.
 */

/** Fixed four chrome positions — not business entity types. */
export type ShellScopeSlotId = "level_1" | "level_2" | "level_3" | "level_4"

export type ShellScopeSegmentBadgeVariant = "default" | "outline" | "secondary"

/** Optional pill next to a segment (e.g. plan tier, env). */
export interface ShellScopeLineageSegmentBadge {
  readonly label: string
  readonly variant?: ShellScopeSegmentBadgeVariant
}

/**
 * One filter in the lineage rail: dimension (tenant-defined) + current value.
 */
export interface ShellScopeLineageSegment {
  readonly id: string
  readonly slot: ShellScopeSlotId
  /**
   * Tenant/API: what this slot represents (e.g. "Company", "Function", or "Company"
   * again for a second company pick). Shown as the switcher section title.
   * If omitted, UI falls back to generic `scope_lineage.slot.{slot}` i18n.
   */
  readonly dimensionLabel?: string
  /** Current selection (entity name, slice, etc.). */
  readonly label: string
  readonly badge?: ShellScopeLineageSegmentBadge
  readonly switchable: boolean
  readonly href?: string
}

export interface ShellScopeLineageModel {
  readonly segments: readonly ShellScopeLineageSegment[]
  readonly isPlaceholder?: boolean
}
