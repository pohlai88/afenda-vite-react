/**
 * SEMANTIC CONTRACT — alert
 * Defines the approved contract for governed alert variants, defaults, and doctrine.
 * Semantics: variants must come from canonical governed unions.
 * Styling: compose from approved registries and wrappers, not feature-level reinvention.
 * Runtime: exported schemas validate trusted shapes where boundary reuse is needed.
 * Consumption: use exported defaults and policy; do not create local alert taxonomies.
 * Defaults: import canonical defaults instead of repeating inline literals.
 * Boundaries: feature code should not define raw alert variants or color overrides.
 * Constraints: no uncontrolled `string` props and no ad hoc semantic invention.
 * Changes: preserve compatibility where practical and validate governance behavior.
 * Purpose: keep alert usage aligned with the semantic architecture.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const alertVariantValues = defineTuple([
  "default",
  "info",
  "success",
  "warning",
  "destructive",
])
export const alertVariantSchema = z.enum(alertVariantValues)
export type AlertVariant = z.infer<typeof alertVariantSchema>

const alertDefaultsSchema = z
  .object({
    variant: alertVariantSchema,
    withIcon: z.boolean(),
  })
  .strict()

export const alertDefaults = defineConstMap(
  alertDefaultsSchema.parse({
    variant: "default",
    withIcon: true,
  })
)

const alertPolicySchema = z
  .object({
    allowInlineRawColorOverride: z.boolean(),
    allowFeatureLevelAlertVariants: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const alertPolicy = defineConstMap(
  alertPolicySchema.parse({
    allowInlineRawColorOverride: false,
    allowFeatureLevelAlertVariants: false,
    allowInlineVisualStyleProps: false,
  })
)

export const alertContract = defineComponentContract({
  vocabularies: { variant: alertVariantValues },
  defaults: alertDefaults,
  policy: alertPolicy,
})
