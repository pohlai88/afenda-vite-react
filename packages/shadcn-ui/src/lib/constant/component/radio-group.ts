/**
 * SEMANTIC CONTRACT — radio-group
 * Source: `src/components/ui/radio-group.tsx` (Radix primitive wrapper).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const radioGroupVariantValues = defineTuple(["default"])
export const radioGroupVariantSchema = z.enum(radioGroupVariantValues)
export type RadioGroupVariant = z.infer<typeof radioGroupVariantSchema>

const radioGroupDefaultsSchema = z
  .object({ variant: radioGroupVariantSchema })
  .strict()

export const radioGroupDefaults = defineConstMap(
  radioGroupDefaultsSchema.parse({ variant: "default" })
)

const radioGroupPolicySchema = z
  .object({
    allowFeatureLevelPrimitiveFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const radioGroupPolicy = defineConstMap(
  radioGroupPolicySchema.parse({
    allowFeatureLevelPrimitiveFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const radioGroupContract = defineComponentContract({
  vocabularies: { variant: radioGroupVariantValues },
  defaults: radioGroupDefaults,
  policy: radioGroupPolicy,
})
