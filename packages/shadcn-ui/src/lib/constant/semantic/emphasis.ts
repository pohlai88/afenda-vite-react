/**
 * SEMANTIC REGISTRY — emphasis
 * Canonical lookup registry for emphasis semantics.
 * Tier: Tier 1: simple registry.
 * Shape: tuple values, union type, Zod enum.
 * Runtime: schema exists for boundary reuse, not as the primary authoring model.
 * Consumption: import the canonical union or schema; do not invent local emphasis strings.
 * Defaults: add `DEFAULT_EMPHASIS` only if the system adopts a true canonical default.
 * Constraints: no duplicate registries and no free-form semantic strings.
 * Changes: preserve deterministic vocabulary and exact value coverage.
 * Purpose: provide one stable emphasis vocabulary with minimal ceremony.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../schema/shared"

export const emphasisValues = defineTuple([
  "subtle",
  "solid",
  "soft",
  "outline",
])
export const emphasisSchema = z.enum(emphasisValues)
export type Emphasis = (typeof emphasisValues)[number]

export const emphasisClassSchema = z.string().trim().min(1)
export const panelEmphasisClassMapSchema = z.record(
  emphasisSchema,
  emphasisClassSchema
)

const panelEmphasisClassMapDefinition = {
  subtle: "ring-1 ring-border/40",
  soft: "ring-1 ring-border/50",
  outline: "ring-1 ring-border",
  solid: "shadow-lg",
} as const satisfies Record<Emphasis, string>

export const panelEmphasisClassMap = defineConstMap(
  panelEmphasisClassMapSchema.parse(panelEmphasisClassMapDefinition)
)

export function getPanelEmphasisClass(emphasis: Emphasis): string {
  return panelEmphasisClassMap[emphasis]
}
