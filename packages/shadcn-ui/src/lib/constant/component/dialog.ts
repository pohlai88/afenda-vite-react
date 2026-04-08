/**
 * SEMANTIC CONTRACT — dialog
 * Defines the approved contract for governed dialog sizes, defaults, and doctrine.
 * Semantics: sizes must come from canonical governed unions.
 * Styling: compose from approved registries and wrappers, not feature-level reinvention.
 * Runtime: exported schemas validate trusted shapes where boundary reuse is needed.
 * Consumption: use exported defaults and policy; do not create local dialog taxonomies.
 * Defaults: import canonical defaults instead of repeating inline literals.
 * Boundaries: feature code should not define raw dialog overlay or size systems.
 * Constraints: no uncontrolled `string` props and no ad hoc semantic invention.
 * Changes: preserve compatibility where practical and validate governance behavior.
 * Purpose: keep dialog usage aligned with the semantic architecture.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const dialogSizeValues = defineTuple(["sm", "md", "lg", "xl", "full"])
export const dialogSizeSchema = z.enum(dialogSizeValues)
export type DialogSize = z.infer<typeof dialogSizeSchema>

const dialogDefaultsSchema = z
  .object({
    size: dialogSizeSchema,
  })
  .strict()

export const dialogDefaults = defineConstMap(
  dialogDefaultsSchema.parse({
    size: "md",
  })
)

const dialogPolicySchema = z
  .object({
    requireTitle: z.boolean(),
    requireDescription: z.boolean(),
    allowFeatureLevelOverlayStyling: z.boolean(),
    allowFeatureLevelSizeOverride: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const dialogPolicy = defineConstMap(
  dialogPolicySchema.parse({
    requireTitle: true,
    requireDescription: false,
    allowFeatureLevelOverlayStyling: false,
    allowFeatureLevelSizeOverride: false,
    allowInlineVisualStyleProps: false,
  })
)

export const dialogContract = defineComponentContract({
  vocabularies: { size: dialogSizeValues },
  defaults: dialogDefaults,
  policy: dialogPolicy,
})
