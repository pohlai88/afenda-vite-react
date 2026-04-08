/**
 * SEMANTIC REGISTRY — radius
 * Canonical lookup registry for radius semantics.
 * Tier: Tier 1: simple registry.
 * Shape: tuple values, union type, Zod enum, const map, getter.
 * Runtime: schema exists for boundary reuse, not as the primary authoring model.
 * Consumption: use `getRadiusClass()` instead of indexing the map directly.
 * Defaults: add `DEFAULT_RADIUS` only if the design system adopts one canonical default.
 * Constraints: no duplicate registries and no free-form semantic strings.
 * Changes: preserve key coverage and keep mappings deterministic.
 * Purpose: provide one stable radius vocabulary with minimal ceremony.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../schema/shared"

export const radiusValues = defineTuple([
  "none",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "full",
])
export const radiusSchema = z.enum(radiusValues)
export type Radius = (typeof radiusValues)[number]

const radiusClassMapDefinition = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  "4xl": "rounded-4xl",
  full: "rounded-full",
} as const satisfies Record<Radius, string>

export const radiusClassMap = defineConstMap(radiusClassMapDefinition)

export function getRadiusClass(radius: Radius): string {
  return radiusClassMap[radius]
}
