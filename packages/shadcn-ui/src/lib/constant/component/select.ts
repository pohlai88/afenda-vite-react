/**
 * SEMANTIC CONTRACT — select
 * Source: `src/components/ui/select.tsx` (Radix primitive wrapper).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const selectVariantValues = defineTuple(["default"])
export const selectVariantSchema = z.enum(selectVariantValues)
export type SelectVariant = z.infer<typeof selectVariantSchema>

const selectDefaultsSchema = z
  .object({ variant: selectVariantSchema })
  .strict()

export const selectDefaults = defineConstMap(
  selectDefaultsSchema.parse({ variant: "default" })
)

const selectPolicySchema = z
  .object({
    allowFeatureLevelPrimitiveFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const selectPolicy = defineConstMap(
  selectPolicySchema.parse({
    allowFeatureLevelPrimitiveFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const selectContract = defineComponentContract({
  vocabularies: { variant: selectVariantValues },
  defaults: selectDefaults,
  policy: selectPolicy,
})
