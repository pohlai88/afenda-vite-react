/**
 * SEMANTIC CONTRACT — field
 * Source: `src/components/ui/field.tsx` — `fieldVariants` orientation + state.
 * State tuple is shared with `form` (`FieldState`).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

import { fieldStateSchema, fieldStateValues } from "./form"

export const fieldOrientationValues = defineTuple([
  "vertical",
  "horizontal",
  "responsive",
])
export const fieldOrientationSchema = z.enum(fieldOrientationValues)
export type FieldOrientation = z.infer<typeof fieldOrientationSchema>

const fieldDefaultsSchema = z
  .object({
    orientation: fieldOrientationSchema,
    state: fieldStateSchema,
  })
  .strict()

export const fieldDefaults = defineConstMap(
  fieldDefaultsSchema.parse({
    orientation: "vertical",
    state: "default",
  })
)

const fieldPolicySchema = z
  .object({
    allowFeatureLevelOrientationExtension: z.boolean(),
    allowFeatureLevelStateExtension: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const fieldPolicy = defineConstMap(
  fieldPolicySchema.parse({
    allowFeatureLevelOrientationExtension: false,
    allowFeatureLevelStateExtension: false,
    allowInlineVisualStyleProps: false,
  })
)

export const fieldContract = defineComponentContract({
  vocabularies: {
    orientation: fieldOrientationValues,
    state: fieldStateValues,
  },
  defaults: fieldDefaults,
  policy: fieldPolicy,
})
