/**
 * SEMANTIC REGISTRY — elevation
 * Canonical lookup registry for elevation semantics.
 * Tier: Tier 1: simple registry.
 * Shape: tuple values, union type, Zod enum, const map, getter.
 * Runtime: schema exists for boundary reuse, not as the primary authoring model.
 * Consumption: use `getElevationClass()` instead of indexing the map directly.
 * Defaults: add `DEFAULT_ELEVATION` only if the design system adopts one canonical default.
 * Constraints: no duplicate registries and no free-form semantic strings.
 * Changes: preserve key coverage and keep mappings deterministic.
 * Purpose: provide one stable elevation vocabulary with minimal ceremony.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../schema/shared"

export const elevationValues = defineTuple([
  "flat",
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
])
export const elevationSchema = z.enum(elevationValues)
export type Elevation = (typeof elevationValues)[number]

const elevationClassMapDefinition = {
  flat: "shadow-none",
  xs: "shadow-xs",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
} as const satisfies Record<Elevation, string>

export const elevationClassMap = defineConstMap(elevationClassMapDefinition)

export function getElevationClass(elevation: Elevation): string {
  return elevationClassMap[elevation]
}
