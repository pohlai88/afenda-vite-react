/**
 * SEMANTIC CONTRACT — label
 * Source: `src/components/ui/label.tsx` (Radix primitive wrapper).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const labelVariantValues = defineTuple(["default"])
export const labelVariantSchema = z.enum(labelVariantValues)
export type LabelVariant = z.infer<typeof labelVariantSchema>

const labelDefaultsSchema = z
  .object({ variant: labelVariantSchema })
  .strict()

export const labelDefaults = defineConstMap(
  labelDefaultsSchema.parse({ variant: "default" })
)

const labelPolicySchema = z
  .object({
    allowFeatureLevelPrimitiveFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const labelPolicy = defineConstMap(
  labelPolicySchema.parse({
    allowFeatureLevelPrimitiveFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const labelContract = defineComponentContract({
  vocabularies: { variant: labelVariantValues },
  defaults: labelDefaults,
  policy: labelPolicy,
})
