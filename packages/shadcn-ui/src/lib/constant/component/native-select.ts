/**
 * SEMANTIC CONTRACT — native-select
 * Source: `src/components/ui/native-select.tsx` (native `<select>` composition).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const nativeSelectVariantValues = defineTuple(["default"])
export const nativeSelectVariantSchema = z.enum(nativeSelectVariantValues)
export type NativeSelectVariant = z.infer<typeof nativeSelectVariantSchema>

const nativeSelectDefaultsSchema = z
  .object({ variant: nativeSelectVariantSchema })
  .strict()

export const nativeSelectDefaults = defineConstMap(
  nativeSelectDefaultsSchema.parse({ variant: "default" })
)

const nativeSelectPolicySchema = z
  .object({
    allowFeatureLevelMarkupFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const nativeSelectPolicy = defineConstMap(
  nativeSelectPolicySchema.parse({
    allowFeatureLevelMarkupFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const nativeSelectContract = defineComponentContract({
  vocabularies: { variant: nativeSelectVariantValues },
  defaults: nativeSelectDefaults,
  policy: nativeSelectPolicy,
})
