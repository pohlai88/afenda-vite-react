/**
 * SEMANTIC REGISTRY — semantic-size
 * Canonical lookup registry for semantic size vocabulary in the semantic UI layer.
 * Tier: Tier 1: simple registry.
 * Shape: tuple values and derived union type.
 * Consumption: import this vocabulary instead of inventing local semantic size strings.
 * Boundaries: this file defines semantic vocabulary only; sizing logic belongs elsewhere.
 * Changes: preserve deterministic vocabulary and exact value coverage.
 * Purpose: keep semantic-size usage consistent across semantic components.
 */
import { z } from "zod"

export const semanticSizeValues = ["xs", "sm", "md", "lg"] as const

export const semanticSizeSchema = z.enum(semanticSizeValues)

export type SemanticSize = z.infer<typeof semanticSizeSchema>
