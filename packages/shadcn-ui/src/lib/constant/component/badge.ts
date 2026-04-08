/**
 * SEMANTIC CONTRACT — badge
 * Defines the approved contract for governed badge variants, emphasis, defaults, and doctrine.
 * Semantics: variants and emphasis must come from canonical governed unions.
 * Styling: compose from approved registries and wrappers, not feature-level reinvention.
 * Runtime: exported schemas validate trusted shapes where boundary reuse is needed.
 * Consumption: use exported defaults and policy; do not create local badge taxonomies.
 * Defaults: import canonical defaults instead of repeating inline literals.
 * Boundaries: feature code should not define raw status-color maps or custom badge variants.
 * Constraints: no uncontrolled `string` props and no ad hoc semantic invention.
 * Changes: preserve compatibility where practical and validate governance behavior.
 * Purpose: keep badge usage aligned with the semantic architecture.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const badgeVariantValues = defineTuple([
  "default",
  "secondary",
  "outline",
  "success",
  "warning",
  "destructive",
  "info",
])
export const badgeVariantSchema = z.enum(badgeVariantValues)
export type BadgeVariant = z.infer<typeof badgeVariantSchema>

export const badgeEmphasisValues = defineTuple(["subtle", "solid"])
export const badgeEmphasisSchema = z.enum(badgeEmphasisValues)
export type BadgeEmphasis = z.infer<typeof badgeEmphasisSchema>

const badgeDefaultsSchema = z
  .object({
    variant: badgeVariantSchema,
    emphasis: badgeEmphasisSchema,
  })
  .strict()

export const badgeDefaults = defineConstMap(
  badgeDefaultsSchema.parse({
    variant: "default",
    emphasis: "subtle",
  })
)

const badgePolicySchema = z
  .object({
    allowStatusColorMapsInFeatures: z.boolean(),
    allowFeatureLevelVariants: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const badgePolicy = defineConstMap(
  badgePolicySchema.parse({
    allowStatusColorMapsInFeatures: false,
    allowFeatureLevelVariants: false,
    allowInlineVisualStyleProps: false,
  })
)

export const badgeContract = defineComponentContract({
  vocabularies: { variant: badgeVariantValues, emphasis: badgeEmphasisValues },
  defaults: badgeDefaults,
  policy: badgePolicy,
})
