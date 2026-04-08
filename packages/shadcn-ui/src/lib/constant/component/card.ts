/**
 * SEMANTIC CONTRACT — card
 * Defines the approved contract for governed card surface and padding semantics.
 * Semantics: surfaces and paddings must come from canonical governed unions.
 * Styling: compose from approved registries and wrappers, not feature-level reinvention.
 * Runtime: exported schemas validate trusted shapes where boundary reuse is needed.
 * Consumption: use exported defaults; do not create local card taxonomies.
 * Defaults: import canonical defaults instead of repeating inline literals.
 * Boundaries: feature code should not define raw card surface vocabularies.
 * Constraints: no uncontrolled `string` props and no ad hoc semantic invention.
 * Changes: preserve compatibility where practical and validate governance behavior.
 * Purpose: keep card usage aligned with the semantic architecture.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const cardSurfaceValues = defineTuple([
  "default",
  "muted",
  "elevated",
  "interactive",
])
export const cardSurfaceSchema = z.enum(cardSurfaceValues)
export type CardSurface = z.infer<typeof cardSurfaceSchema>

export const cardPaddingValues = defineTuple(["sm", "default", "lg"])
export const cardPaddingSchema = z.enum(cardPaddingValues)
export type CardPadding = z.infer<typeof cardPaddingSchema>

const cardDefaultsSchema = z
  .object({
    surface: cardSurfaceSchema,
    padding: cardPaddingSchema,
  })
  .strict()

export const cardDefaults = defineConstMap(
  cardDefaultsSchema.parse({
    surface: "default",
    padding: "default",
  })
)

const cardPolicySchema = z
  .object({
    allowFeatureLevelSurfaceOverride: z.boolean(),
    allowFeatureLevelPaddingOverride: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const cardPolicy = defineConstMap(
  cardPolicySchema.parse({
    allowFeatureLevelSurfaceOverride: false,
    allowFeatureLevelPaddingOverride: false,
    allowInlineVisualStyleProps: false,
  })
)

export const cardContract = defineComponentContract({
  vocabularies: { surface: cardSurfaceValues, padding: cardPaddingValues },
  defaults: cardDefaults,
  policy: cardPolicy,
})
