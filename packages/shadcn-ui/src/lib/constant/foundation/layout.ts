/**
 * SEMANTIC REGISTRY — layout
 * Canonical lookup registry for content-width, stack-gap, and grid-layout semantics.
 * Tier: Tier 1: simple registry.
 * Shape: tuple values, union types, Zod enums, const maps, getters.
 * Runtime: schemas exist for boundary reuse, not as the primary authoring model.
 * Consumption: use exported getters instead of indexing layout maps directly.
 * Defaults: add `DEFAULT_*` only when the layout system adopts true canonical defaults.
 * Constraints: no duplicate registries and no ad hoc width, gap, or grid vocabularies.
 * Changes: preserve deterministic mappings and exact key coverage.
 * Purpose: provide one stable layout vocabulary with minimal ceremony.
 */
import { z } from "zod/v4"

import { booleanFlagSchema, defineConstMap, defineTuple } from "../schema/shared"

export const contentWidthValues = defineTuple([
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "full",
])
export const contentWidthSchema = z.enum(contentWidthValues)
export type ContentWidth = (typeof contentWidthValues)[number]

const contentWidthClassMapDefinition = {
  xs: "max-w-screen-xs",
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-none",
} as const satisfies Record<ContentWidth, string>

export const contentWidthClassMap = defineConstMap(
  contentWidthClassMapDefinition
)

export function getContentWidthClass(contentWidth: ContentWidth): string {
  return contentWidthClassMap[contentWidth]
}

export const stackGapValues = defineTuple(["0", "1", "2", "3", "4", "6", "8"])
export const stackGapSchema = z.enum(stackGapValues)
export type StackGap = (typeof stackGapValues)[number]

const stackGapClassMapDefinition = {
  "0": "gap-0",
  "1": "gap-1",
  "2": "gap-2",
  "3": "gap-3",
  "4": "gap-4",
  "6": "gap-6",
  "8": "gap-8",
} as const satisfies Record<StackGap, string>

export const stackGapClassMap = defineConstMap(stackGapClassMapDefinition)

export function getStackGapClass(stackGap: StackGap): string {
  return stackGapClassMap[stackGap]
}

export const gridLayoutValues = defineTuple(["single", "split", "cards"])
export const gridLayoutSchema = z.enum(gridLayoutValues)
export type GridLayout = (typeof gridLayoutValues)[number]

export const DEFAULT_GRID_LAYOUT: GridLayout = "single"

const gridLayoutClassMapDefinition = {
  single: "grid grid-cols-1",
  split: "grid gap-3 md:grid-cols-2",
  cards: "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3",
} as const satisfies Record<GridLayout, string>

export const gridLayoutClassMap = defineConstMap(gridLayoutClassMapDefinition)

const layoutPolicySchema = z
  .object({
    allowFeatureLevelGridTaxonomy: booleanFlagSchema,
    allowFeatureLevelTrackDefinitions: booleanFlagSchema,
    allowFeatureLevelGapOverride: booleanFlagSchema,
  })
  .strict()

export const layoutPolicy = defineConstMap(
  layoutPolicySchema.parse({
    allowFeatureLevelGridTaxonomy: false,
    allowFeatureLevelTrackDefinitions: false,
    allowFeatureLevelGapOverride: false,
  })
)

export function getGridLayoutClass(gridLayout: GridLayout): string {
  return gridLayoutClassMap[gridLayout]
}
