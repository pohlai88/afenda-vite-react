/**
 * SEMANTIC REGISTRY — surface
 * Canonical lookup registry for surface semantics.
 * Tier: Tier 1: simple registry.
 * Shape: tuple values, union type, Zod enum.
 * Runtime: schema exists for boundary reuse, not as the primary authoring model.
 * Consumption: import the canonical union or schema; do not invent local surface strings.
 * Defaults: add `DEFAULT_SURFACE` only if the system adopts a true canonical default.
 * Constraints: no duplicate registries and no free-form semantic strings.
 * Changes: preserve deterministic vocabulary and exact value coverage.
 * Purpose: provide one stable surface vocabulary with minimal ceremony.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../schema/shared"

export const surfaceValues = defineTuple([
  "canvas",
  "panel",
  "elevated",
  "overlay",
  "inverse",
])
export const surfaceSchema = z.enum(surfaceValues)
export type Surface = (typeof surfaceValues)[number]

export const surfaceClassSchema = z.string().trim().min(1)
export const surfaceClassMapSchema = z.record(surfaceSchema, surfaceClassSchema)

const surfaceClassMapDefinition = {
  canvas: "border-transparent bg-background text-foreground shadow-none",
  panel: "border-border bg-card text-card-foreground shadow-sm",
  elevated:
    "border-border bg-card text-card-foreground shadow-md ring-1 ring-border/50",
  overlay:
    "border-border/70 bg-background/95 text-foreground shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/90",
  inverse: "border-foreground/10 bg-foreground text-background shadow-lg",
} as const satisfies Record<Surface, string>

export const surfaceClassMap = defineConstMap(
  surfaceClassMapSchema.parse(surfaceClassMapDefinition)
)

export function getSurfaceClass(surface: Surface): string {
  return surfaceClassMap[surface]
}
