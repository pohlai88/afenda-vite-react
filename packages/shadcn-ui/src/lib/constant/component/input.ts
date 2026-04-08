/**
 * SEMANTIC CONTRACT — input
 * Defines the approved contract for governed input sizes, defaults, and doctrine.
 * Semantics: sizes must come from canonical governed unions.
 * Styling: compose from approved registries and wrappers, not feature-level reinvention.
 * Runtime: exported schemas validate trusted shapes where boundary reuse is needed.
 * Consumption: use exported defaults and policy; do not create local input taxonomies.
 * Defaults: import canonical defaults instead of repeating inline literals.
 * Boundaries: feature code should not define raw height overrides or visual-style drift.
 * Constraints: no uncontrolled `string` props and no ad hoc semantic invention.
 * Changes: preserve compatibility where practical and validate governance behavior.
 * Purpose: keep input usage aligned with the semantic architecture.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const inputSizeValues = defineTuple(["sm", "default", "lg"])
export const inputSizeSchema = z.enum(inputSizeValues)
export type InputSize = z.infer<typeof inputSizeSchema>

const inputDefaultsSchema = z
  .object({
    size: inputSizeSchema,
  })
  .strict()

export const inputDefaults = defineConstMap(
  inputDefaultsSchema.parse({
    size: "default",
  })
)

const inputPolicySchema = z
  .object({
    allowPrefixSlot: z.boolean(),
    allowSuffixSlot: z.boolean(),
    allowFeatureLevelHeightOverride: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const inputPolicy = defineConstMap(
  inputPolicySchema.parse({
    allowPrefixSlot: true,
    allowSuffixSlot: true,
    allowFeatureLevelHeightOverride: false,
    allowInlineVisualStyleProps: false,
  })
)

export const inputContract = defineComponentContract({
  vocabularies: { size: inputSizeValues },
  defaults: inputDefaults,
  policy: inputPolicy,
})
