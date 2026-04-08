/**
 * SEMANTIC CONTRACT — checkbox
 * Source: `src/components/ui/checkbox.tsx` (Radix primitive wrapper).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const checkboxVariantValues = defineTuple(["default"])
export const checkboxVariantSchema = z.enum(checkboxVariantValues)
export type CheckboxVariant = z.infer<typeof checkboxVariantSchema>

const checkboxDefaultsSchema = z
  .object({ variant: checkboxVariantSchema })
  .strict()

export const checkboxDefaults = defineConstMap(
  checkboxDefaultsSchema.parse({ variant: "default" })
)

const checkboxPolicySchema = z
  .object({
    allowFeatureLevelPrimitiveFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const checkboxPolicy = defineConstMap(
  checkboxPolicySchema.parse({
    allowFeatureLevelPrimitiveFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const checkboxContract = defineComponentContract({
  vocabularies: { variant: checkboxVariantValues },
  defaults: checkboxDefaults,
  policy: checkboxPolicy,
})
