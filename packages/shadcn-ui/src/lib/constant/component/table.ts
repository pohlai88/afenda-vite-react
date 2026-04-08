/**
 * SEMANTIC CONTRACT — table
 * Defines the approved contract for governed table density, defaults, and doctrine.
 * Semantics: densities must come from canonical governed unions.
 * Styling: compose from approved registries and wrappers, not feature-level reinvention.
 * Runtime: exported schemas validate trusted shapes where boundary reuse is needed.
 * Consumption: use exported defaults and policy; do not create local table taxonomies.
 * Defaults: import canonical defaults instead of repeating inline literals.
 * Boundaries: feature code should not define raw row-height or column-gap systems.
 * Constraints: no uncontrolled `string` props and no ad hoc semantic invention.
 * Changes: preserve compatibility where practical and validate governance behavior.
 * Purpose: keep table usage aligned with the semantic architecture.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const tableDensityValues = defineTuple([
  "compact",
  "default",
  "comfortable",
])
export const tableDensitySchema = z.enum(tableDensityValues)
export type TableDensity = z.infer<typeof tableDensitySchema>

const tableDefaultsSchema = z
  .object({
    density: tableDensitySchema,
    striped: z.boolean(),
    stickyHeader: z.boolean(),
    sortableIndicatorRequired: z.boolean(),
  })
  .strict()

export const tableDefaults = defineConstMap(
  tableDefaultsSchema.parse({
    density: "default",
    striped: false,
    stickyHeader: false,
    sortableIndicatorRequired: true,
  })
)

const tablePolicySchema = z
  .object({
    allowFeatureLevelRowHeightOverride: z.boolean(),
    allowFeatureLevelColumnGapOverride: z.boolean(),
    allowFeatureLevelDensityExtension: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const tablePolicy = defineConstMap(
  tablePolicySchema.parse({
    allowFeatureLevelRowHeightOverride: false,
    allowFeatureLevelColumnGapOverride: false,
    allowFeatureLevelDensityExtension: false,
    allowInlineVisualStyleProps: false,
  })
)

export const tableContract = defineComponentContract({
  vocabularies: { density: tableDensityValues },
  defaults: tableDefaults,
  policy: tablePolicy,
})
