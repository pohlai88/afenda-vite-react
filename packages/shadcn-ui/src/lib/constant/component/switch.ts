/**
 * SEMANTIC CONTRACT — switch
 * Source: `src/components/ui/switch.tsx` (Radix primitive wrapper).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const switchVariantValues = defineTuple(["default"])
export const switchVariantSchema = z.enum(switchVariantValues)
export type SwitchVariant = z.infer<typeof switchVariantSchema>

const switchDefaultsSchema = z
  .object({ variant: switchVariantSchema })
  .strict()

export const switchDefaults = defineConstMap(
  switchDefaultsSchema.parse({ variant: "default" })
)

const switchPolicySchema = z
  .object({
    allowFeatureLevelPrimitiveFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const switchPolicy = defineConstMap(
  switchPolicySchema.parse({
    allowFeatureLevelPrimitiveFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const switchContract = defineComponentContract({
  vocabularies: { variant: switchVariantValues },
  defaults: switchDefaults,
  policy: switchPolicy,
})
