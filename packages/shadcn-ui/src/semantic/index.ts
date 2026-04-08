/**
 * MODULE ENTRYPOINT — semantic
 * Public export barrel for the governed semantic layer.
 * Scope: re-exports semantic components, domain adapters, and semantic primitives.
 * Consumption: feature code should prefer this surface over low-level primitive reinvention.
 * Boundaries: exports should remain business-facing and semantically meaningful.
 * Changes: keep the semantic surface small, intentional, and reviewable.
 * Purpose: provide one stable semantic entry surface for consumers and tooling.
 */
export * from "./components/semantic-alert"
export * from "./components/semantic-badge"
export * from "./components/semantic-field"
export * from "./components/semantic-panel"
export * from "./components/semantic-section"

export * from "./domain/allocation"
export * from "./domain/evidence"
export * from "./domain/invariant"
export * from "./domain/reconciliation"
export * from "./domain/settlement"
export * from "./domain/truth-severity"

export * from "./primitives/density"
export * from "./primitives/emphasis"
export * from "./primitives/size"
export * from "./primitives/state"
export * from "./primitives/surface"
export * from "./primitives/tone"
