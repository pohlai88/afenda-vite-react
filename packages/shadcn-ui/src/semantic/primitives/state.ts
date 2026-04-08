/**
 * SEMANTIC REGISTRY — semantic-state
 * Canonical lookup registry for semantic state vocabulary in the semantic UI layer.
 * Tier: Tier 1: simple registry.
 * Shape: tuple values and derived union type.
 * Consumption: import this vocabulary instead of inventing local semantic state strings.
 * Boundaries: this file defines semantic vocabulary only; behavior mapping belongs elsewhere.
 * Changes: preserve deterministic vocabulary and exact value coverage.
 * Purpose: keep semantic-state usage consistent across semantic components.
 */
export const semanticStateValues = [
  "idle",
  "active",
  "selected",
  "disabled",
  "loading",
  "readonly",
] as const

export type SemanticState = (typeof semanticStateValues)[number]
