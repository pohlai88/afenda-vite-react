/**
 * SEMANTIC CONTRACT — form
 * Defines the approved contract for governed form field-state semantics and doctrine.
 * Semantics: field states must come from canonical governed unions.
 * Styling: compose from approved registries and wrappers, not feature-level reinvention.
 * Runtime: exported schemas validate trusted shapes where boundary reuse is needed.
 * Consumption: use exported policy and canonical field-state values; do not invent local mappings.
 * Defaults: add canonical defaults only when the form contract adopts them intentionally.
 * Boundaries: feature code should not define raw validation-tone systems.
 * Constraints: no uncontrolled `string` props and no ad hoc semantic invention.
 * Changes: preserve compatibility where practical and validate governance behavior.
 * Purpose: keep form usage aligned with the semantic architecture.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const fieldStateValues = defineTuple([
  "default",
  "invalid",
  "disabled",
  "readonly",
])
export const fieldStateSchema = z.enum(fieldStateValues)
export type FieldState = z.infer<typeof fieldStateSchema>

const formDefaultsSchema = z
  .object({
    fieldState: fieldStateSchema,
  })
  .strict()

export const formDefaults = defineConstMap(
  formDefaultsSchema.parse({
    fieldState: "default",
  })
)

const formPolicySchema = z
  .object({
    requireFieldMessageSlot: z.boolean(),
    requireAccessibleLabel: z.boolean(),
    allowFeatureLevelValidationToneMaps: z.boolean(),
    allowFeatureLevelFieldStateExtension: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const formPolicy = defineConstMap(
  formPolicySchema.parse({
    requireFieldMessageSlot: true,
    requireAccessibleLabel: true,
    allowFeatureLevelValidationToneMaps: false,
    allowFeatureLevelFieldStateExtension: false,
    allowInlineVisualStyleProps: false,
  })
)

export const formContract = defineComponentContract({
  vocabularies: { fieldState: fieldStateValues },
  defaults: formDefaults,
  policy: formPolicy,
})
